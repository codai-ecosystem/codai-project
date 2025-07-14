'use client'

import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database,
  Cpu,
  Activity,
  Users,
  HardDrive,
  Zap,
  Brain,
  Server,
  Globe,
  BarChart3,
  Layers,
  Clock,
  Shield,
  Wifi,
  WifiOff,
  Search,
  Settings,
  Plus,
  Network,
  Lightbulb,
  ArrowUpRight,
  FileText,
  TrendingUp,
  Target,
  Link,
  ChevronRight,
  MoreVertical,
  Filter
} from 'lucide-react'
import { MemoraiService } from '@/services/memorai.service'
import { DatabaseStats, MemoryEntry, RealTimeData } from '@/types/memorai'

const inter = Inter({ subsets: ['latin'] })

interface MemoryStats {
  totalMemories: number
  connections: number
  recentActivity: number
  aiInsights: number
}

interface QuickAction {
  icon: any
  label: string
  description: string
  color: string
}

interface AIInsight {
  id: string
  type: 'pattern' | 'connection' | 'gap'
  title: string
  description: string
  confidence: number
  actions: string[]
}

export default function MemoraiPage() {
  const [isOnline, setIsOnline] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [recentMemories, setRecentMemories] = useState<MemoryEntry[]>([])
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Real search functionality using MCP recall
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch('/api/mcp/recall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: 'memorai-ui-agent',
          query: query.trim(),
          limit: 10
        })
      })

      const result = await response.json()

      if (result.success) {
        setSearchResults(result.memories || [])
        console.log(`Found ${result.count} memories from ${result.sources?.mcp || 0} MCP + ${result.sources?.backup || 0} backup`)
      } else {
        console.error('Search failed:', result)
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Enhanced memory statistics
  const memoryStats: MemoryStats = {
    totalMemories: 2847,
    connections: 18492,
    recentActivity: 127,
    aiInsights: 43
  }

  const quickActions: QuickAction[] = [
    {
      icon: Plus,
      label: 'Create Memory',
      description: 'Add new information to your knowledge base',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Search,
      label: 'Search Memories',
      description: 'Find relevant information quickly',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Network,
      label: 'View Graph',
      description: 'Explore knowledge connections',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Lightbulb,
      label: 'Generate Insights',
      description: 'Discover patterns and opportunities',
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  const aiInsights: AIInsight[] = [
    {
      id: '1',
      type: 'pattern',
      title: 'Memory Pattern Detected',
      description: 'You tend to create more technical memories on Tuesdays and Thursdays',
      confidence: 87,
      actions: ['Apply', 'Dismiss']
    },
    {
      id: '2',
      type: 'connection',
      title: 'Connection Opportunity',
      description: 'Recent meeting notes could be linked to your project documentation',
      confidence: 92,
      actions: ['Apply', 'Dismiss']
    },
    {
      id: '3',
      type: 'gap',
      title: 'Knowledge Gap',
      description: 'Consider adding more memories about deployment strategies',
      confidence: 74,
      actions: ['Apply', 'Dismiss']
    }
  ]

  const sampleMemories = [
    {
      id: '1',
      title: 'AI Model Architecture',
      category: 'research',
      content: 'Detailed analysis of transformer architecture improvements and optimization techniques for large language models...',
      connections: 12,
      tags: ['#AI', '#research'],
      priority: 'high',
      timeAgo: '2 hours ago'
    },
    {
      id: '2',
      title: 'Team Sprint Planning',
      category: 'meeting',
      content: 'Sprint planning meeting notes including user story priorities, technical debt items, and team capacity planning...',
      connections: 8,
      tags: ['#planning', '#team'],
      priority: 'medium',
      timeAgo: '1 day ago'
    },
    {
      id: '3',
      title: 'Code Review Guidelines',
      category: 'document',
      content: 'Comprehensive guidelines for code review process including security checks, performance considerations, and style standards...',
      connections: 15,
      tags: ['#code', '#quality'],
      priority: 'high',
      timeAgo: '3 days ago'
    },
    {
      id: '4',
      title: 'Product Innovation Ideas',
      category: 'idea',
      content: 'Brainstorming session results for new product features including AI-powered recommendations and user experience improvements...',
      connections: 6,
      tags: ['#innovation', '#product'],
      priority: 'medium',
      timeAgo: '1 week ago'
    }
  ]

  const recentActivity = [
    {
      id: '1',
      action: 'Added new research findings',
      description: 'Created memory about AI model optimization techniques',
      icon: Brain,
      color: 'text-purple-400',
      time: '2 minutes ago'
    },
    {
      id: '2',
      action: 'Connected related memories',
      description: 'Linked project planning with team meeting notes',
      icon: Network,
      color: 'text-blue-400',
      time: '15 minutes ago'
    },
    {
      id: '3',
      action: 'Generated insight',
      description: 'Found pattern in code review feedback across projects',
      icon: Lightbulb,
      color: 'text-yellow-400',
      time: '1 hour ago'
    },
    {
      id: '4',
      action: 'Searched memories',
      description: 'Found 12 relevant memories for "machine learning deployment"',
      icon: Search,
      color: 'text-emerald-400',
      time: '2 hours ago'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      try {
        const [dbStats, memories] = await Promise.all([
          MemoraiService.getDatabaseStats(),
          MemoraiService.getMemories(undefined, 5)
        ])

        setStats(dbStats)
        setRecentMemories(memories)
        setLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }

    loadData()

    // Set up real-time data updates
    const realTimeInterval = setInterval(() => {
      setRealTimeData(MemoraiService.generateRealTimeData())
    }, 2000)

    // Subscribe to real-time memory updates
    const unsubscribe = MemoraiService.subscribeToMemories(
      (memories) => setRecentMemories(memories.slice(0, 5)),
      undefined,
      5
    )

    return () => {
      clearInterval(realTimeInterval)
      unsubscribe()
    }
  }, [])

  const createSampleMemory = async () => {
    try {
      // Use real MCP integration instead of mock data
      const response = await fetch('/api/mcp/remember', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: 'memorai-ui-agent',
          content: `Production memory created at ${new Date().toLocaleTimeString()}: Real user interaction with MemorAI dashboard. User performed memory creation action, demonstrating system functionality and user engagement.`,
          metadata: {
            type: 'user-interaction',
            source: 'dashboard-ui',
            timestamp: new Date().toISOString(),
            importance: 8,
            tags: ['dashboard', 'user-action', 'production', 'memorai'],
            context: 'dashboard-demo'
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('Memory stored successfully:', result);
        // Trigger UI refresh to show new memory
        if (typeof window !== 'undefined') {
          // Show success notification
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
          notification.textContent = `✅ Memory stored: ${result.memoryId}`;
          document.body.appendChild(notification);

          setTimeout(() => {
            document.body.removeChild(notification);
          }, 3000);
        }
      } else {
        console.error('Failed to store memory:', result);
      }
    } catch (error) {
      console.error('Error creating memory:', error);
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-400'
      case 'medium': return 'bg-yellow-400'
      case 'low': return 'bg-emerald-400'
      default: return 'bg-slate-400'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'research': return Brain
      case 'meeting': return Users
      case 'document': return FileText
      case 'idea': return Lightbulb
      default: return Database
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white ${inter.className}`}>
      {/* Enhanced Navigation with Real Search */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-2xl border-b border-white/20 p-4 mb-8"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold">MemorAI</h1>
              <p className="text-sm text-slate-300">Intelligent Memory Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Real Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
              <Search className={`absolute right-3 top-2.5 w-4 h-4 text-slate-400 ${isSearching ? 'animate-spin' : ''}`} />

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-12 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-lg max-h-64 overflow-y-auto z-50">
                  {searchResults.map((result, index) => (
                    <div key={result.id || index} className="p-3 hover:bg-white/10 border-b border-white/10 last:border-b-0">
                      <div className="text-white font-medium text-sm mb-1">
                        {result.metadata?.type || 'Memory'} • Relevance: {((result.relevance || 0) * 100).toFixed(0)}%
                      </div>
                      <div className="text-slate-300 text-sm line-clamp-2">
                        {result.content.substring(0, 120)}...
                      </div>
                      <div className="text-slate-500 text-xs mt-1">
                        {result.metadata?.source || 'Unknown source'} • {new Date(result.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="px-4 py-2 bg-white/10 backdrop-blur-xl rounded-lg hover:bg-white/20 transition-all">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Welcome to MemorAI 🧠
              </motion.span>
            </h1>
            <p className="text-slate-300 text-lg">
              Your intelligent memory and knowledge management system
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={createSampleMemory}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Memory</span>
          </motion.button>
        </motion.div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: 'Total Memories',
              value: memoryStats.totalMemories.toLocaleString(),
              change: '+12%',
              icon: Brain,
              color: 'from-purple-500 to-pink-500'
            },
            {
              label: 'Connections',
              value: memoryStats.connections.toLocaleString(),
              change: '+8%',
              icon: Network,
              color: 'from-blue-500 to-cyan-500'
            },
            {
              label: 'Recent Activity',
              value: memoryStats.recentActivity.toString(),
              change: '+15%',
              icon: Activity,
              color: 'from-emerald-500 to-teal-500'
            },
            {
              label: 'AI Insights',
              value: memoryStats.aiInsights.toString(),
              change: '+25%',
              icon: Lightbulb,
              color: 'from-yellow-500 to-orange-500'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-emerald-400">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm font-medium">{stat.change}</span>
                    </div>
                    <span className="text-slate-400 text-sm">vs last week</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-white font-semibold text-lg mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-purple-300 transition-colors">
                  {action.label}
                </h3>
                <p className="text-slate-400 text-sm mb-4">{action.description}</p>
                <div className="flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
                  <span className="text-sm font-medium">Go</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Memories */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-semibold text-lg">Recent Memories</h2>
                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sampleMemories.map((memory, index) => {
                  const CategoryIcon = getCategoryIcon(memory.category)
                  return (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <CategoryIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold group-hover:text-purple-300 transition-colors">
                              {memory.title}
                            </h3>
                            <p className="text-slate-400 text-sm">{memory.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(memory.priority)}`}></div>
                          <button className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm mb-4">{memory.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{memory.timeAgo}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Network className="w-3 h-3" />
                            <span>{memory.connections} connections</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {memory.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-2 py-1 bg-white/10 text-slate-300 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Memory Performance Chart */}
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Weekly Performance</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-slate-300">Memories</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-300">Connections</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-slate-300">Insights</span>
                  </div>
                </div>
              </div>
              <div className="h-48">
                <div className="flex items-end justify-between h-full space-x-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="flex-1 flex flex-col items-center">
                      <div className="flex items-end space-x-1 h-32 mb-2">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${30 + Math.random() * 50}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="bg-purple-500 rounded-t w-2"
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${20 + Math.random() * 60}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 + 0.1 }}
                          className="bg-blue-500 rounded-t w-2"
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${10 + Math.random() * 40}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                          className="bg-yellow-500 rounded-t w-2"
                        />
                      </div>
                      <span className="text-slate-400 text-xs">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Knowledge Graph Preview */}
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Knowledge Graph</h3>
                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  View Full Graph
                </button>
              </div>
              <div className="relative h-64 bg-slate-900/50 rounded-lg overflow-hidden">
                <svg className="w-full h-full">
                  {/* Connections */}
                  <motion.line
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2 }}
                    x1="150" y1="100" x2="300" y2="150"
                    stroke="rgba(147, 51, 234, 0.3)"
                    strokeWidth="2"
                  />
                  <motion.line
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 0.2 }}
                    x1="150" y1="100" x2="100" y2="200"
                    stroke="rgba(147, 51, 234, 0.3)"
                    strokeWidth="2"
                  />
                  <motion.line
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 0.4 }}
                    x1="300" y1="150" x2="250" y2="250"
                    stroke="rgba(147, 51, 234, 0.3)"
                    strokeWidth="2"
                  />
                  <motion.line
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 0.6 }}
                    x1="100" y1="200" x2="250" y2="250"
                    stroke="rgba(147, 51, 234, 0.3)"
                    strokeWidth="2"
                  />
                  <motion.line
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 0.8 }}
                    x1="300" y1="150" x2="350" y2="80"
                    stroke="rgba(147, 51, 234, 0.3)"
                    strokeWidth="2"
                  />

                  {/* Nodes */}
                  <motion.circle
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    cx="150" cy="100" r="20"
                    className="fill-purple-500"
                  />
                  <motion.circle
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    cx="300" cy="150" r="16"
                    className="fill-blue-500"
                  />
                  <motion.circle
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    cx="100" cy="200" r="18"
                    className="fill-emerald-500"
                  />
                  <motion.circle
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                    cx="250" cy="250" r="14"
                    className="fill-yellow-500"
                  />
                  <motion.circle
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 2 }}
                    cx="350" cy="80" r="12"
                    className="fill-red-500"
                  />

                  {/* Labels */}
                  <text x="150" y="70" textAnchor="middle" className="fill-white text-xs">AI Research</text>
                  <text x="300" y="130" textAnchor="middle" className="fill-white text-xs">ML Models</text>
                  <text x="100" y="180" textAnchor="middle" className="fill-white text-xs">Planning</text>
                  <text x="250" y="230" textAnchor="middle" className="fill-white text-xs">Meeting</text>
                  <text x="350" y="60" textAnchor="middle" className="fill-white text-xs">Code</text>
                </svg>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Recent Activity</h3>
                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-3 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center ${activity.color}`}>
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{activity.action}</p>
                      <p className="text-slate-400 text-sm">{activity.description}</p>
                      <p className="text-slate-500 text-xs mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  AI Insights
                </h3>
                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  Generate More
                </button>
              </div>
              <div className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <h4 className="text-white font-medium text-sm">{insight.title}</h4>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span className="text-emerald-400 text-xs">{insight.confidence}%</span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm mb-3">{insight.description}</p>
                    <div className="flex justify-end space-x-2">
                      {insight.actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors ${action === 'Apply'
                            ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                            : 'bg-white/10 text-slate-300 hover:bg-white/15'
                            }`}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Memory Usage Trends */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
              Memory Usage Trends
            </h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-slate-300">Created</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-slate-300">Accessed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-slate-300">Connected</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-3xl font-bold text-purple-400 mb-2"
              >
                2,847
              </motion.div>
              <div className="text-slate-400 text-sm">Total Memories</div>
              <div className="text-emerald-400 text-xs flex items-center justify-center mt-1">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +12% this week
              </div>
            </div>

            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="text-3xl font-bold text-blue-400 mb-2"
              >
                6.5
              </motion.div>
              <div className="text-slate-400 text-sm">Avg Connections</div>
              <div className="text-emerald-400 text-xs flex items-center justify-center mt-1">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +8% this week
              </div>
            </div>

            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="text-3xl font-bold text-emerald-400 mb-2"
              >
                43
              </motion.div>
              <div className="text-slate-400 text-sm">AI Insights</div>
              <div className="text-emerald-400 text-xs flex items-center justify-center mt-1">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +25% this week
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}