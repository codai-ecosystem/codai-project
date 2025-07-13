'use client'

import React, { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Scale,
  FileText,
  Users,
  Search,
  Calendar,
  Clock,
  DollarSign,
  Shield,
  Briefcase,
  BookOpen,
  Settings,
  Bell,
  Menu,
  X,
  ChevronDown,
  User,
  HelpCircle,
  LogOut
} from 'lucide-react'

interface LegalizeAILayoutProps {
  children: ReactNode
}

const LegalizeAILayout: React.FC<LegalizeAILayoutProps> = ({ children }) => {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)

  const navigationItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: Scale,
      active: pathname === '/dashboard' || pathname === '/'
    },
    {
      label: 'Cases',
      href: '/cases',
      icon: Briefcase,
      active: pathname.startsWith('/cases')
    },
    {
      label: 'Documents',
      href: '/documents',
      icon: FileText,
      active: pathname.startsWith('/documents')
    },
    {
      label: 'Clients',
      href: '/clients',
      icon: Users,
      active: pathname.startsWith('/clients')
    },
    {
      label: 'Research',
      href: '/research',
      icon: Search,
      active: pathname.startsWith('/research')
    },
    {
      label: 'Compliance',
      href: '/compliance',
      icon: Shield,
      active: pathname.startsWith('/compliance')
    },
    {
      label: 'Time Tracking',
      href: '/time',
      icon: Clock,
      active: pathname.startsWith('/time')
    },
    {
      label: 'Billing',
      href: '/billing',
      icon: DollarSign,
      active: pathname.startsWith('/billing')
    },
    {
      label: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      active: pathname.startsWith('/calendar')
    },
    {
      label: 'Knowledge Base',
      href: '/knowledge',
      icon: BookOpen,
      active: pathname.startsWith('/knowledge')
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      active: pathname.startsWith('/settings')
    }
  ]

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  }

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: { duration: 0.2 }
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -20
    },
    visible: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          variants={overlayVariants}
          initial="closed"
          animate="open"
          exit="closed"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className={`fixed left-0 top-0 h-full w-72 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-50 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:static lg:z-auto transition-transform duration-300 ease-in-out lg:transition-none`}
        variants={sidebarVariants}
        initial="closed"
        animate={sidebarOpen ? "open" : "closed"}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LegalizeAI
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI Legal Platform</p>
              </div>
            </motion.div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {navigationItems.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.href}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${item.active
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${item.active ? 'text-white' : 'group-hover:scale-110'
                        }`}
                    />
                    <span className="font-medium">{item.label}</span>
                    {item.active && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-white rounded-full"
                        layoutId="activeIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                JS
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">Jane Smith</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Senior Partner</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Menu */}
            {userMenuOpen && (
              <motion.div
                className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/help"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Help & Support</span>
                </Link>
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-red-600 dark:text-red-400">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {navigationItems.find(item => item.active)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  AI-powered legal services platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 rounded-xl px-4 py-2 min-w-[300px]">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cases, documents, clients..."
                  className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 focus:outline-none"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <motion.button
                  className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  </span>
                </motion.button>

                <motion.button
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Quick Action
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default LegalizeAILayout
