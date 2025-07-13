'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Brain,
  Search,
  Database,
  BarChart3,
  Settings,
  Plus,
  Menu,
  X,
  Home,
  Zap,
  Network,
  FileText,
  Users,
  Bell,
  ChevronDown,
  Activity,
  Clock,
  Star,
  TrendingUp,
  Layers,
  Link as LinkIcon,
  Globe,
  Lightbulb,
  Archive
} from 'lucide-react'

interface MemorAILayoutProps {
  children: React.ReactNode
}

export default function MemorAILayout({ children }: MemorAILayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      description: 'Memory overview and insights'
    },
    {
      name: 'Memories',
      href: '/memories',
      icon: Brain,
      description: 'Browse and manage memories',
      badge: '2.1k'
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
      description: 'Find memories and connections'
    },
    {
      name: 'Knowledge Graph',
      href: '/graph',
      icon: Network,
      description: 'Visualize memory connections'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Memory usage analytics'
    },
    {
      name: 'Integration',
      href: '/integration',
      icon: LinkIcon,
      description: 'Connect external sources'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Configure MemorAI'
    }
  ]

  const quickActions = [
    {
      name: 'Add Memory',
      icon: Plus,
      action: 'create-memory',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Quick Search',
      icon: Search,
      action: 'quick-search',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Generate Insight',
      icon: Lightbulb,
      action: 'generate-insight',
      color: 'from-emerald-500 to-teal-500'
    }
  ]

  const memoryStats = {
    totalMemories: 2847,
    recentActivity: 156,
    connections: 8234,
    insights: 42
  }

  const recentMemories = [
    {
      id: '1',
      title: 'Project Architecture Meeting',
      type: 'meeting',
      timestamp: '2 hours ago',
      importance: 0.95
    },
    {
      id: '2',
      title: 'React Performance Optimization',
      type: 'research',
      timestamp: '4 hours ago',
      importance: 0.87
    },
    {
      id: '3',
      title: 'Client Feedback Analysis',
      type: 'analysis',
      timestamp: '6 hours ago',
      importance: 0.78
    }
  ]

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const getImportanceColor = (importance: number) => {
    if (importance >= 0.9) return 'text-red-400'
    if (importance >= 0.7) return 'text-yellow-400'
    return 'text-emerald-400'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return Users
      case 'research':
        return FileText
      case 'analysis':
        return BarChart3
      default:
        return Brain
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative flex h-screen">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="w-80 bg-black/20 backdrop-blur-xl border-r border-white/20 flex flex-col"
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-white font-bold text-lg">MemorAI</h1>
                      <p className="text-slate-400 text-sm">Memory Intelligence</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-6 border-b border-white/20">
                <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={action.name}
                      className={`w-full flex items-center space-x-3 p-3 bg-gradient-to-r ${action.color} rounded-lg text-white font-medium hover:opacity-90 transition-opacity`}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <action.icon className="w-5 h-5" />
                      <span>{action.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex-1 p-6 overflow-y-auto">
                <h3 className="text-white font-semibold mb-4">Navigation</h3>
                <nav className="space-y-2">
                  {navigationItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = isActiveRoute(item.href)

                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          className={`group flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${isActive
                              ? 'bg-white/20 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : ''}`} />
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-slate-500">{item.description}</div>
                            </div>
                          </div>
                          {item.badge && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </motion.div>
                    )
                  })}
                </nav>
              </div>

              {/* Memory Stats */}
              <div className="p-6 border-t border-white/20">
                <h3 className="text-white font-semibold mb-4">Memory Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-400">
                      {memoryStats.totalMemories.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">Total Memories</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-2xl font-bold text-cyan-400">
                      {memoryStats.connections.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">Connections</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-2xl font-bold text-emerald-400">
                      {memoryStats.recentActivity}
                    </div>
                    <div className="text-xs text-slate-400">Recent Activity</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-400">
                      {memoryStats.insights}
                    </div>
                    <div className="text-xs text-slate-400">New Insights</div>
                  </div>
                </div>
              </div>

              {/* Recent Memories */}
              <div className="p-6 border-t border-white/20">
                <h3 className="text-white font-semibold mb-4">Recent Memories</h3>
                <div className="space-y-3">
                  {recentMemories.map((memory, index) => {
                    const TypeIcon = getTypeIcon(memory.type)

                    return (
                      <motion.div
                        key={memory.id}
                        className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <TypeIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {memory.title}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-slate-400 text-xs">{memory.timestamp}</p>
                            <div className={`w-2 h-2 rounded-full ${getImportanceColor(memory.importance)}`} />
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* User Profile */}
              <div className="p-6 border-t border-white/20">
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">AI</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">AI Memory Agent</p>
                      <p className="text-slate-400 text-sm">Active Memory Session</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800/90 backdrop-blur-xl rounded-lg border border-white/20 py-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors">
                          Memory Preferences
                        </button>
                        <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors">
                          Export Memories
                        </button>
                        <button className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors">
                          Clear Session
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation */}
          <div className="bg-black/20 backdrop-blur-xl border-b border-white/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5 text-slate-400" />
                </button>

                <div className="hidden md:flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm">Active Session</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400 text-sm">2h 34m</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search memories..."
                    className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                  />
                </div>

                <motion.button
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="w-5 h-5 text-slate-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
