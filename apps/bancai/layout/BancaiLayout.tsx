'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  BarChart3,
  LineChart,
  Settings,
  Bell,
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  Home,
  Activity,
  Target,
  Shield,
  Calculator,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Minus,
  Filter,
  Calendar,
  Globe,
  Lock,
  Unlock,
  Star,
  Heart,
  Zap,
  Briefcase,
  Building,
  Car,
  Landmark
} from 'lucide-react'

interface BancaiLayoutProps {
  children: any
}

interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  badge?: string
  subItems?: NavigationItem[]
}

export function BancaiLayout({ children }: BancaiLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showBalances, setShowBalances] = useState(true)
  const [notifications, setNotifications] = useState(3)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      href: '/dashboard'
    },
    {
      id: 'accounts',
      label: 'Accounts',
      icon: <Wallet className="w-5 h-5" />,
      href: '/accounts',
      subItems: [
        { id: 'checking', label: 'Checking', icon: <DollarSign className="w-4 h-4" />, href: '/accounts/checking' },
        { id: 'savings', label: 'Savings', icon: <PiggyBank className="w-4 h-4" />, href: '/accounts/savings' },
        { id: 'credit', label: 'Credit Cards', icon: <CreditCard className="w-4 h-4" />, href: '/accounts/credit' }
      ]
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <Activity className="w-5 h-5" />,
      href: '/transactions'
    },
    {
      id: 'budgets',
      label: 'Budgets',
      icon: <Target className="w-5 h-5" />,
      href: '/budgets',
      badge: '3'
    },
    {
      id: 'investments',
      label: 'Investments',
      icon: <TrendingUp className="w-5 h-5" />,
      href: '/investments',
      subItems: [
        { id: 'portfolio', label: 'Portfolio', icon: <BarChart3 className="w-4 h-4" />, href: '/investments/portfolio' },
        { id: 'watchlist', label: 'Watchlist', icon: <Eye className="w-4 h-4" />, href: '/investments/watchlist' },
        { id: 'research', label: 'Research', icon: <Search className="w-4 h-4" />, href: '/investments/research' }
      ]
    },
    {
      id: 'goals',
      label: 'Financial Goals',
      icon: <Star className="w-5 h-5" />,
      href: '/goals'
    },
    {
      id: 'loans',
      label: 'Loans & Credit',
      icon: <Building className="w-5 h-5" />,
      href: '/loans',
      subItems: [
        { id: 'applications', label: 'Applications', icon: <FileText className="w-4 h-4" />, href: '/loans/applications' },
        { id: 'credit-score', label: 'Credit Score', icon: <Shield className="w-4 h-4" />, href: '/loans/credit-score' },
        { id: 'calculator', label: 'Calculator', icon: <Calculator className="w-4 h-4" />, href: '/loans/calculator' }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <LineChart className="w-5 h-5" />,
      href: '/analytics'
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield className="w-5 h-5" />,
      href: '/security',
      subItems: [
        { id: 'fraud-alerts', label: 'Fraud Alerts', icon: <AlertTriangle className="w-4 h-4" />, href: '/security/fraud' },
        { id: 'privacy', label: 'Privacy Settings', icon: <Lock className="w-4 h-4" />, href: '/security/privacy' },
        { id: 'devices', label: 'Trusted Devices', icon: <Globe className="w-4 h-4" />, href: '/security/devices' }
      ]
    },
    {
      id: 'support',
      label: 'Support',
      icon: <Heart className="w-5 h-5" />,
      href: '/support'
    }
  ]

  const quickStats = [
    {
      label: 'Total Balance',
      value: showBalances ? '$58,270.75' : '••••••',
      change: '+2.5%',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      label: 'Monthly Income',
      value: showBalances ? '$8,500.00' : '••••••',
      change: '+5.2%',
      trend: 'up',
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      label: 'Monthly Expenses',
      value: showBalances ? '$4,200.00' : '••••••',
      change: '-1.8%',
      trend: 'down',
      icon: <TrendingDown className="w-6 h-6" />
    },
    {
      label: 'Credit Score',
      value: '742',
      change: '+12 pts',
      trend: 'up',
      icon: <Shield className="w-6 h-6" />
    }
  ]

  const recentActivity = [
    { id: '1', type: 'credit', amount: '+$2,500.00', description: 'Salary Deposit', time: '2 hours ago' },
    { id: '2', type: 'debit', amount: '-$85.20', description: 'Grocery Store', time: '4 hours ago' },
    { id: '3', type: 'debit', amount: '-$1,200.00', description: 'Rent Payment', time: '1 day ago' },
    { id: '4', type: 'investment', amount: '+$125.50', description: 'Dividend Payment', time: '2 days ago' }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setNotifications(prev => Math.max(0, prev + (Math.random() > 0.8 ? 1 : 0)))
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleBalanceVisibility = () => {
    setShowBalances(!showBalances)
  }

  const handleNotificationClick = () => {
    setNotifications(0)
  }

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ?
      <ArrowUpRight className="w-4 h-4 text-emerald-400" /> :
      <ArrowDownRight className="w-4 h-4 text-red-400" />
  }

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-emerald-400' : 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Landmark className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Bancai
                </h1>
                <p className="text-xs text-slate-400">AI Banking Platform</p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions, accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleBalanceVisibility}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title={showBalances ? 'Hide balances' : 'Show balances'}
            >
              {showBalances ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>

            <button
              onClick={handleNotificationClick}
              className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10"
                  >
                    <div className="p-2">
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700 rounded">
                        Profile Settings
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700 rounded">
                        Security Settings
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700 rounded">
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex pt-20">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="fixed left-0 top-20 bottom-0 w-80 bg-slate-900/50 backdrop-blur-md border-r border-slate-700/50 z-40 overflow-y-auto"
            >
              <div className="p-6">
                {/* Quick Stats */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                    Quick Overview
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {quickStats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg border border-emerald-500/20">
                            {stat.icon}
                          </div>
                          {getTrendIcon(stat.trend)}
                        </div>
                        <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                        <p className="text-lg font-bold text-white">{stat.value}</p>
                        <p className={`text-xs ${getTrendColor(stat.trend)}`}>{stat.change}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                    Banking Services
                  </h3>
                  <nav className="space-y-2">
                    {navigationItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                      >
                        <button
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === item.id
                              ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400'
                              : 'hover:bg-slate-800/50 text-slate-300 hover:text-white'
                            }`}
                        >
                          <div className="flex items-center space-x-3">
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </button>

                        {item.subItems && activeTab === item.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="ml-8 mt-2 space-y-1"
                          >
                            {item.subItems.map((subItem) => (
                              <button
                                key={subItem.id}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/30 rounded transition-colors"
                              >
                                {subItem.icon}
                                <span>{subItem.label}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </nav>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-center space-x-3 p-3 bg-slate-800/20 rounded-lg border border-slate-700/20"
                      >
                        <div className={`w-2 h-2 rounded-full ${activity.type === 'credit' ? 'bg-emerald-400' :
                            activity.type === 'debit' ? 'bg-red-400' :
                              'bg-blue-400'
                          }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{activity.description}</p>
                          <p className="text-xs text-slate-400">{activity.time}</p>
                        </div>
                        <p className={`text-sm font-medium ${activity.type === 'credit' ? 'text-emerald-400' :
                            activity.type === 'debit' ? 'text-red-400' :
                              'text-blue-400'
                          }`}>
                          {activity.amount}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : ''
            }`}
        >
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Quick Action Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 1 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      {/* Financial Health Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/40 to-emerald-500/20 overflow-hidden">
        <motion.div
          className="h-full w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Security Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="fixed bottom-6 left-6 bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 rounded-lg p-3 z-40"
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Bank-grade Security Active</span>
        </div>
      </motion.div>
    </div>
  )
}
