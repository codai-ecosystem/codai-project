'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Code,
  FileText,
  Search,
  Settings,
  User,
  Bell,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
  Brain,
  Cpu,
  Database,
  GitBranch,
  TestTube,
  Shield,
  Gauge,
  BookOpen,
  Lightbulb,
  Target,
  Activity,
  TrendingUp,
  Clock,
  Star,
  MessageSquare,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Share,
  Bookmark,
  Filter,
  SortAsc,
  Grid,
  List,
  MoreHorizontal,
  ChevronLeft,
  Home,
  Folder,
  Terminal,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'

interface AideLayoutProps {
  children: React.ReactNode
}

interface SidebarItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  badge?: string
  submenu?: SidebarItem[]
}

const AideLayout = ({ children }: AideLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['assistant'])
  const [notifications, setNotifications] = useState(3)
  const [currentUser] = useState({
    name: 'Developer',
    avatar: '/avatar-placeholder.png',
    role: 'Senior Developer'
  })

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      path: '/dashboard'
    },
    {
      id: 'assistant',
      label: 'AI Assistant',
      icon: <Bot className="w-5 h-5" />,
      path: '/assistant',
      badge: 'AI',
      submenu: [
        {
          id: 'chat',
          label: 'Code Chat',
          icon: <MessageSquare className="w-4 h-4" />,
          path: '/assistant/chat'
        },
        {
          id: 'generation',
          label: 'Code Generation',
          icon: <Sparkles className="w-4 h-4" />,
          path: '/assistant/generation'
        },
        {
          id: 'analysis',
          label: 'Code Analysis',
          icon: <Eye className="w-4 h-4" />,
          path: '/assistant/analysis'
        },
        {
          id: 'optimization',
          label: 'Code Optimization',
          icon: <Zap className="w-4 h-4" />,
          path: '/assistant/optimization'
        }
      ]
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <Folder className="w-5 h-5" />,
      path: '/projects',
      submenu: [
        {
          id: 'my-projects',
          label: 'My Projects',
          icon: <Folder className="w-4 h-4" />,
          path: '/projects/my'
        },
        {
          id: 'templates',
          label: 'Templates',
          icon: <FileText className="w-4 h-4" />,
          path: '/projects/templates'
        },
        {
          id: 'snippets',
          label: 'Code Snippets',
          icon: <Code className="w-4 h-4" />,
          path: '/projects/snippets'
        }
      ]
    },
    {
      id: 'tools',
      label: 'Development Tools',
      icon: <Cpu className="w-5 h-5" />,
      path: '/tools',
      submenu: [
        {
          id: 'terminal',
          label: 'AI Terminal',
          icon: <Terminal className="w-4 h-4" />,
          path: '/tools/terminal'
        },
        {
          id: 'refactor',
          label: 'Code Refactoring',
          icon: <GitBranch className="w-4 h-4" />,
          path: '/tools/refactor'
        },
        {
          id: 'testing',
          label: 'Test Generation',
          icon: <TestTube className="w-4 h-4" />,
          path: '/tools/testing'
        },
        {
          id: 'documentation',
          label: 'Doc Generator',
          icon: <FileText className="w-4 h-4" />,
          path: '/tools/docs'
        }
      ]
    },
    {
      id: 'analysis',
      label: 'Code Analysis',
      icon: <Brain className="w-5 h-5" />,
      path: '/analysis',
      submenu: [
        {
          id: 'quality',
          label: 'Quality Check',
          icon: <Star className="w-4 h-4" />,
          path: '/analysis/quality'
        },
        {
          id: 'security',
          label: 'Security Scan',
          icon: <Shield className="w-4 h-4" />,
          path: '/analysis/security'
        },
        {
          id: 'performance',
          label: 'Performance',
          icon: <Gauge className="w-4 h-4" />,
          path: '/analysis/performance'
        },
        {
          id: 'dependencies',
          label: 'Dependencies',
          icon: <Database className="w-4 h-4" />,
          path: '/analysis/dependencies'
        }
      ]
    },
    {
      id: 'learning',
      label: 'Learning Hub',
      icon: <BookOpen className="w-5 h-5" />,
      path: '/learning',
      badge: 'NEW',
      submenu: [
        {
          id: 'paths',
          label: 'Learning Paths',
          icon: <Target className="w-4 h-4" />,
          path: '/learning/paths'
        },
        {
          id: 'tutorials',
          label: 'Tutorials',
          icon: <Play className="w-4 h-4" />,
          path: '/learning/tutorials'
        },
        {
          id: 'challenges',
          label: 'Code Challenges',
          icon: <Lightbulb className="w-4 h-4" />,
          path: '/learning/challenges'
        },
        {
          id: 'progress',
          label: 'My Progress',
          icon: <TrendingUp className="w-4 h-4" />,
          path: '/learning/progress'
        }
      ]
    }
  ]

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  const handleMenuClick = (item: SidebarItem) => {
    if (item.submenu) {
      toggleMenu(item.id)
    } else {
      setActiveSection(item.id)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white/5 backdrop-blur-xl border-r border-white/10"
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Aide</h1>
                  <p className="text-sm text-blue-300">AI Development Assistant</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {sidebarItems.map((item) => (
                <div key={item.id}>
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => handleMenuClick(item)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${activeSection === item.id
                        ? 'bg-blue-500/30 border border-blue-500/50 text-white'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <span className={`px-2 py-1 text-xs rounded-full ${item.badge === 'AI' ? 'bg-purple-500/30 text-purple-300' :
                            item.badge === 'NEW' ? 'bg-green-500/30 text-green-300' :
                              'bg-blue-500/30 text-blue-300'
                          }`}>
                          {item.badge}
                        </span>
                      )}
                      {item.submenu && (
                        <motion.div
                          animate={{ rotate: expandedMenus.includes(item.id) ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>

                  {/* Submenu */}
                  <AnimatePresence>
                    {item.submenu && expandedMenus.includes(item.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 mt-2 space-y-1 overflow-hidden"
                      >
                        {item.submenu.map((subItem) => (
                          <motion.button
                            key={subItem.id}
                            whileHover={{ x: 4 }}
                            onClick={() => setActiveSection(subItem.id)}
                            className={`w-full flex items-center space-x-3 p-2 rounded-md transition-all duration-200 ${activeSection === subItem.id
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                              }`}
                          >
                            {subItem.icon}
                            <span className="text-sm">{subItem.label}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* System Status */}
            <div className="p-4 border-t border-white/10">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">AI Status</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Processing Power</span>
                    <span className="text-white">92%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      transition={{ duration: 1 }}
                      className="bg-green-400 h-1 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{currentUser.name}</p>
                  <p className="text-xs text-gray-400">{currentUser.role}</p>
                </div>
                <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm">
                <span className="text-gray-400">Aide</span>
                <ChevronRight className="w-4 h-4 text-gray-500" />
                <span className="text-white font-medium capitalize">
                  {activeSection.replace('-', ' ')}
                </span>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ask AI anything..."
                  className="pl-10 pr-4 py-2 w-80 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors"
                  title="New AI Session"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 transition-colors"
                  title="Quick Analysis"
                >
                  <Brain className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 transition-colors"
                  title="Generate Code"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </div>

              {/* AI Activity Indicator */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">AI Ready</span>
                <Activity className="w-4 h-4 text-green-400" />
              </div>

              {/* View Options */}
              <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
                <button className="p-1.5 bg-blue-500/30 text-blue-400 rounded">
                  <Grid className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {/* AI Assistant Status Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">AI Development Assistant</h3>
                  <p className="text-blue-300 text-sm">Ready to help with code generation, analysis, and optimization</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Model</p>
                  <p className="text-white font-medium">GPT-4 Turbo</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Performance</p>
                  <p className="text-green-400 font-medium">Optimal</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors"
                >
                  Start Session
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">127</p>
                  <p className="text-gray-400 text-sm">AI Sessions</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Code className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">2.3K</p>
                  <p className="text-gray-400 text-sm">Code Generated</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">89%</p>
                  <p className="text-gray-400 text-sm">Analysis Score</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">4.2h</p>
                  <p className="text-gray-400 text-sm">Time Saved</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Content */}
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default AideLayout
