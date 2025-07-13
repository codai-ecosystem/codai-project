'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Target,
  Users,
  TrendingUp,
  PenTool,
  Mail,
  Settings,
  Search,
  Bell,
  User,
  Home,
  Eye,
  Zap,
  DollarSign,
  MessageSquare,
  Calendar,
  FileText,
  Megaphone,
  Globe
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MarketAILayoutProps {
  children: React.ReactNode
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
}

const navigation: NavItem[] = [
  { href: '/marketai', label: 'Dashboard', icon: Home },
  { href: '/marketai/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/marketai/audiences', label: 'Audiences', icon: Users },
  { href: '/marketai/content', label: 'Content', icon: PenTool },
  { href: '/marketai/leads', label: 'Leads', icon: Target },
  { href: '/marketai/automation', label: 'Automation', icon: Zap },
  { href: '/marketai/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/marketai/optimization', label: 'AI Optimization', icon: TrendingUp },
  { href: '/marketai/reports', label: 'Reports', icon: FileText },
  { href: '/marketai/integrations', label: 'Integrations', icon: Globe },
  { href: '/marketai/calendar', label: 'Calendar', icon: Calendar },
  { href: '/marketai/settings', label: 'Settings', icon: Settings }
]

const MarketAILayout: React.FC<MarketAILayoutProps> = ({ children }) => {
  const pathname = usePathname()

  const sidebarVariants = {
    hidden: { x: -280, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  }

  const navItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  }

  const headerVariants = {
    hidden: { y: -60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.2
      }
    }
  }

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.3
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-950 dark:via-purple-950 dark:to-pink-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-orange-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Sidebar */}
      <motion.aside
        className="fixed left-0 top-0 z-40 h-screen w-72"
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="h-full backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 p-6 border-b border-gray-200/50 dark:border-gray-700/50"
            variants={navItemVariants}
          >
            <div className="relative">
              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Target className="w-6 h-6 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                MarketAI
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AI Marketing Platform
              </p>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            className="p-6 border-b border-gray-200/50 dark:border-gray-700/50"
            variants={navItemVariants}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">12</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Active Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">4.2x</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Avg ROAS</div>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2">
            {navigation.map((item, index) => {
              const isActive = pathname ? (pathname === item.href || (item.href !== '/marketai' && pathname.startsWith(item.href))) : false

              return (
                <motion.div
                  key={item.href}
                  variants={navItemVariants}
                  custom={index}
                >
                  <Link href={item.href}>
                    <motion.div
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                        }`}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-purple-500'}`} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          className="ml-auto w-2 h-2 bg-white rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          {/* User Profile */}
          <motion.div
            className="p-6 border-t border-gray-200/50 dark:border-gray-700/50"
            variants={navItemVariants}
          >
            <motion.div
              className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:shadow-md transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  Marketing Manager
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Pro Plan Active
                </p>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  4.2x
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="ml-72">
        {/* Header */}
        <motion.header
          className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pathname ? (navigation.find(item => pathname === item.href || (item.href !== '/marketai' && pathname.startsWith(item.href)))?.label || 'Dashboard') : 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Optimize your marketing with AI insights
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
              >
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="w-64 px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </motion.div>

              {/* Campaign Status */}
              <motion.div
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  12 Active
                </span>
              </motion.div>

              {/* Notifications */}
              <motion.button
                className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-5 h-5" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>

              {/* ROI Indicator */}
              <motion.div
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl"
                whileHover={{ scale: 1.02 }}
              >
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  +24% ROI
                </span>
              </motion.div>

              {/* Profile */}
              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <User className="w-5 h-5 text-white" />
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <motion.main
          className="flex-1 p-8"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}

export default MarketAILayout
