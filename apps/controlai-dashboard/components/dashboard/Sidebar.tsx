'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  BarChart3, 
  Settings, 
  Bell,
  Search,
  Plus,
  Home
} from 'lucide-react'

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
  className?: string
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, path: '/dashboard/projects' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/dashboard/tasks' },
  { id: 'agents', label: 'Agents', icon: Users, path: '/dashboard/agents' },
  { id: 'metrics', label: 'Metrics', icon: BarChart3, path: '/dashboard/metrics' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' },
]

export function Sidebar({ isCollapsed = false, onToggle, className = '' }: SidebarProps) {
  const [activeItem, setActiveItem] = React.useState('overview')

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0, width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`
        fixed left-0 top-0 h-screen z-40
        bg-white dark:bg-gray-900 
        border-r border-gray-200 dark:border-gray-700
        shadow-lg dark:shadow-xl
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">
              ControlAI
            </span>
          </motion.div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <LayoutDashboard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.div>
        </button>
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors">
              <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {!isCollapsed && <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">New</span>}
            </button>
            <button className="flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              {!isCollapsed && <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Search</span>}
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveItem(item.id)}
            className={`
              w-full flex items-center p-3 rounded-lg transition-all duration-200
              ${activeItem === item.id 
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
              ${isCollapsed ? 'justify-center' : 'justify-start'}
            `}
          >
            <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium"
              >
                {item.label}
              </motion.span>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Status Indicator */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {!isCollapsed && (
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                All systems operational
              </span>
            )}
          </div>
          {!isCollapsed && (
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
