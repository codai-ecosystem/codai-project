'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Heart,
  Search,
  TrendingUp,
  Tag,
  Gift,
  Star,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Package,
  BarChart3,
  Shield,
  HelpCircle,
  ChevronDown,
  ShoppingBag,
  Percent,
  Zap,
  Target
} from 'lucide-react'

interface CumparAILayoutProps {
  children: React.ReactNode
}

const CumparAILayout: React.FC<CumparAILayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(3)
  const [wishlistCount, setWishlistCount] = useState(12)
  const [notifications, setNotifications] = useState(5)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      description: 'Shopping overview and recommendations'
    },
    {
      name: 'Browse Products',
      href: '/products',
      icon: Package,
      description: 'Explore our product catalog'
    },
    {
      name: 'Compare',
      href: '/compare',
      icon: BarChart3,
      description: 'Compare products side by side'
    },
    {
      name: 'Deals & Offers',
      href: '/deals',
      icon: Tag,
      description: 'Best deals and discounts'
    },
    {
      name: 'Price Tracker',
      href: '/tracker',
      icon: TrendingUp,
      description: 'Track price changes and alerts'
    },
    {
      name: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
      description: 'Your saved products'
    },
    {
      name: 'Smart Cart',
      href: '/cart',
      icon: ShoppingCart,
      description: 'AI-optimized shopping cart'
    },
    {
      name: 'AI Insights',
      href: '/insights',
      icon: Zap,
      description: 'Personalized shopping insights'
    },
    {
      name: 'Market Trends',
      href: '/trends',
      icon: Target,
      description: 'Market analysis and trends'
    },
    {
      name: 'Rewards',
      href: '/rewards',
      icon: Gift,
      description: 'Loyalty points and rewards'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Account and preferences'
    }
  ]

  const userMenuItems = [
    { name: 'Profile', icon: User, href: '/profile' },
    { name: 'Order History', icon: Package, href: '/orders' },
    { name: 'Notifications', icon: Bell, href: '/notifications' },
    { name: 'Help & Support', icon: HelpCircle, href: '/support' },
    { name: 'Privacy & Security', icon: Shield, href: '/privacy' },
    { name: 'Sign Out', icon: LogOut, href: '/logout' }
  ]

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
      transition: { duration: 0.3 }
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className="fixed left-0 top-0 h-full w-80 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-50 md:translate-x-0"
        variants={sidebarVariants}
        initial="closed"
        animate={sidebarOpen ? "open" : "closed"}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    CumparAI
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AI Shopping Platform</p>
                </div>
              </motion.div>

              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-3 text-white">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="font-semibold">{cartCount}</span>
                </div>
                <p className="text-xs opacity-80">Cart Items</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-3 text-white">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span className="font-semibold">{wishlistCount}</span>
                </div>
                <p className="text-xs opacity-80">Wishlist</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <nav className="space-y-2">
              {navigationItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="group flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200"
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 rounded-lg flex items-center justify-center transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {item.description}
                    </p>
                  </div>
                  {item.name === 'Deals & Offers' && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </motion.a>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-5 h-5" />
                <span className="font-semibold">Smart Savings</span>
              </div>
              <p className="text-sm opacity-90">You've saved $127.50 this month with AI recommendations!</p>
              <button className="mt-2 text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="md:ml-80">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search Bar */}
              <div className="relative hidden sm:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products, brands, or deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {searchQuery && (
                  <motion.div
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="p-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
                        Search suggestions for "{searchQuery}"
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Price Alert Button */}
              <motion.button
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <TrendingUp className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
              </motion.button>

              {/* Notifications */}
              <motion.button
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                    {notifications}
                  </div>
                )}
              </motion.button>

              {/* Cart */}
              <motion.button
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                    {cartCount}
                  </div>
                )}
              </motion.button>

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    JD
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-semibold text-gray-900 dark:text-white">John Doe</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">john.doe@example.com</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Star className="w-4 h-4 fill-current text-yellow-400" />
                          <span className="text-sm font-medium">Premium Member</span>
                        </div>
                      </div>
                      <div className="p-2">
                        {userMenuItems.map((item, index) => (
                          <motion.a
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            whileHover={{ scale: 1.02, x: 4 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <item.icon className="w-4 h-4" />
                            <span className="text-sm">{item.name}</span>
                          </motion.a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Background Pattern */}
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
    </div>
  )
}

export default CumparAILayout
