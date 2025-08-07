'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Menu,
  ChevronDown
} from 'lucide-react'

interface HeaderProps {
  onToggleSidebar?: () => void
  className?: string
}

export function Header({ onToggleSidebar, className = '' }: HeaderProps) {
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  const [showUserMenu, setShowUserMenu] = React.useState(false)
  const [showNotifications, setShowNotifications] = React.useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // In a real app, this would update the theme context
  }

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`
        fixed top-0 right-0 left-0 z-30 h-16
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
        border-b border-gray-200 dark:border-gray-700
        ${className}
      `}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Search Bar */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects, tasks, agents..."
              className="
                block w-80 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600
                rounded-lg bg-gray-50 dark:bg-gray-800 
                text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors
              "
            />
          </div>
        </div>

        {/* Center Section - Breadcrumb or Page Title */}
        <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Dashboard</span>
          <ChevronDown className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">Overview</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="text-sm text-gray-900 dark:text-white">
                        Task "API Integration" completed
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        2 minutes ago
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center">
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                Admin User
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="py-1">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
