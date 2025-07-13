'use client'

import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WalletService from '../lib/wallet-service'
import {
  Wallet,
  CreditCard,
  PieChart,
  ArrowUpDown,
  Shield,
  Settings,
  Bell,
  QrCode,
  Scan,
  Send,
  ArrowDownToLine,
  TrendingUp,
  History,
  Coins,
  Gem,
  Layers,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Minus,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Filter,
  Search,
  SortAsc
} from 'lucide-react'

interface WalletLayoutProps {
  children: ReactNode
  title?: string
  showHeader?: boolean
  showSidebar?: boolean
  showBottomNav?: boolean
}

export default function WalletLayout({
  children,
  title = "Wallet",
  showHeader = true,
  showSidebar = true,
  showBottomNav = true
}: WalletLayoutProps) {

  const sidebarSections = [
    {
      title: 'Portfolio',
      items: [
        { icon: <Wallet className="w-5 h-5" />, label: 'Overview', href: '/overview', badge: null },
        { icon: <Coins className="w-5 h-5" />, label: 'Assets', href: '/assets', badge: '12' },
        { icon: <Gem className="w-5 h-5" />, label: 'NFTs', href: '/nfts', badge: '3' },
        { icon: <PieChart className="w-5 h-5" />, label: 'Analytics', href: '/analytics', badge: null }
      ]
    },
    {
      title: 'Transactions',
      items: [
        { icon: <Send className="w-5 h-5" />, label: 'Send', href: '/send', badge: null },
        { icon: <ArrowDownToLine className="w-5 h-5" />, label: 'Receive', href: '/receive', badge: null },
        { icon: <ArrowUpDown className="w-5 h-5" />, label: 'Swap', href: '/swap', badge: null },
        { icon: <History className="w-5 h-5" />, label: 'History', href: '/history', badge: null }
      ]
    },
    {
      title: 'DeFi',
      items: [
        { icon: <TrendingUp className="w-5 h-5" />, label: 'Staking', href: '/staking', badge: '2' },
        { icon: <Layers className="w-5 h-5" />, label: 'Liquidity', href: '/liquidity', badge: '1' },
        { icon: <CreditCard className="w-5 h-5" />, label: 'Lending', href: '/lending', badge: null },
        { icon: <Globe className="w-5 h-5" />, label: 'Protocols', href: '/protocols', badge: null }
      ]
    },
    {
      title: 'Tools',
      items: [
        { icon: <QrCode className="w-5 h-5" />, label: 'QR Code', href: '/qr', badge: null },
        { icon: <Scan className="w-5 h-5" />, label: 'Scanner', href: '/scanner', badge: null },
        { icon: <Shield className="w-5 h-5" />, label: 'Security', href: '/security', badge: null },
        { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/settings', badge: null }
      ]
    }
  ]

  const quickActions = [
    { icon: <Send className="w-6 h-6" />, label: 'Send', href: '/send', color: 'bg-blue-500' },
    { icon: <ArrowDownToLine className="w-6 h-6" />, label: 'Receive', href: '/receive', color: 'bg-green-500' },
    { icon: <ArrowUpDown className="w-6 h-6" />, label: 'Swap', href: '/swap', color: 'bg-purple-500' },
    { icon: <Plus className="w-6 h-6" />, label: 'Buy', href: '/buy', color: 'bg-orange-500' }
  ]

  const bottomNavItems = [
    { icon: <Wallet className="w-5 h-5" />, label: 'Wallet', href: '/', isActive: true },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'DeFi', href: '/defi', isActive: false },
    { icon: <Gem className="w-5 h-5" />, label: 'NFTs', href: '/nfts', isActive: false },
    { icon: <History className="w-5 h-5" />, label: 'History', href: '/history', isActive: false },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/settings', isActive: false }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-30">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        {showSidebar && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className="w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">CODAI Wallet</h1>
                  <p className="text-sm text-gray-400">Digital Asset Management</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${action.color} rounded-xl p-3 text-white flex flex-col items-center space-y-1`}
                  >
                    {action.icon}
                    <span className="text-xs font-medium">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-6 space-y-6 overflow-y-auto">
              {sidebarSections.map((section, sectionIndex) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item, index) => (
                      <motion.a
                        key={item.label}
                        href={item.href}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-gray-400 group-hover:text-white transition-colors">
                            {item.icon}
                          </div>
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </motion.a>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-6 border-t border-white/10">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Secure Connection</p>
                  <p className="text-xs text-gray-400">Hardware wallet connected</p>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </motion.aside>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          {showHeader && (
            <motion.header
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">{title}</h1>
                  <p className="text-sm text-gray-400">Manage your digital assets</p>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Network Selector */}
                  <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-white">Ethereum</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>

                  {/* Account Balance */}
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Total Balance</p>
                    <p className="text-lg font-bold text-white">$8,860.31</p>
                  </div>

                  {/* Notifications */}
                  <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">2</span>
                    </span>
                  </button>

                  {/* More Actions */}
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quick Stats Bar */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">24h Change</span>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-lg font-bold text-green-400">+2.45%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Active Positions</span>
                    <Layers className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-lg font-bold text-white">3</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Gas Price</span>
                    <RefreshCw className="w-4 h-4 text-orange-400" />
                  </div>
                  <p className="text-lg font-bold text-white">18 gwei</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">NFTs</span>
                    <Gem className="w-4 h-4 text-pink-400" />
                  </div>
                  <p className="text-lg font-bold text-white">7</p>
                </div>
              </div>
            </motion.header>
          )}

          {/* Main Content Area */}
          <main className="flex-1 p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {children}
            </motion.div>
          </main>

          {/* Bottom Navigation (Mobile) */}
          {showBottomNav && (
            <motion.nav
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="md:hidden bg-white/5 backdrop-blur-xl border-t border-white/10 px-4 py-2"
            >
              <div className="flex items-center justify-around">
                {bottomNavItems.map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${item.isActive
                        ? 'text-purple-400 bg-purple-500/20'
                        : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    {item.icon}
                    <span className="text-xs font-medium">{item.label}</span>
                  </motion.a>
                ))}
              </div>
            </motion.nav>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg flex items-center justify-center text-white z-50"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Security Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 backdrop-blur-xl rounded-full border border-green-500/30">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-xs text-green-400 font-medium">Secure</span>
        </div>
      </div>
    </div>
  )
}
