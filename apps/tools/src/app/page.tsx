'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Wrench, Zap, Code2, Database, FileText, Image, Music, Video, 
  Calculator, Palette, Globe, Search, Filter, TrendingUp, Users,
  Activity, Clock, Star, ArrowRight, Settings, Upload, Download,
  Cpu, HardDrive, Wifi, Shield, CheckCircle, AlertCircle
} from 'lucide-react'

// TypeScript Interfaces
interface ToolCategory {
  id: string
  name: string
  count: number
  icon: any
  color: string
  description: string
  growthRate: number
}

interface PopularTool {
  id: string
  name: string
  category: string
  usage: string
  rating: number
  icon: any
  description: string
  lastUsed: string
  trending: boolean
}

interface ToolsMetrics {
  totalTools: number
  activeUsers: string
  dailyUsage: string
  successRate: number
  avgProcessingTime: string
  totalProcessed: string
}

interface RecentActivity {
  id: string
  tool: string
  user: string
  action: string
  status: 'completed' | 'processing' | 'failed'
  time: string
  duration: string
}

interface SystemStatus {
  name: string
  status: 'operational' | 'warning' | 'error'
  uptime: string
  responseTime: string
}

export default function ToolsDashboard() {
  // State Management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'analytics'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Mock Data with Enhanced Structure
  const toolsMetrics: ToolsMetrics = {
    totalTools: 47,
    activeUsers: '8,423',
    dailyUsage: '15,267',
    successRate: 98.7,
    avgProcessingTime: '1.4s',
    totalProcessed: '2.4M'
  }

  const categories: ToolCategory[] = [
    { 
      id: 'text', 
      name: 'Text Processing', 
      count: 12, 
      icon: FileText, 
      color: 'text-blue-600',
      description: 'Text formatting, conversion, and analysis tools',
      growthRate: 15.3
    },
    { 
      id: 'image', 
      name: 'Image Tools', 
      count: 8, 
      icon: Image, 
      color: 'text-purple-600',
      description: 'Image editing, conversion, and optimization',
      growthRate: 22.1
    },
    { 
      id: 'code', 
      name: 'Code Utilities', 
      count: 9, 
      icon: Code2, 
      color: 'text-green-600',
      description: 'Development tools and code utilities',
      growthRate: 18.7
    },
    { 
      id: 'data', 
      name: 'Data Tools', 
      count: 7, 
      icon: Database, 
      color: 'text-indigo-600',
      description: 'Data processing and conversion tools',
      growthRate: 12.4
    },
    { 
      id: 'media', 
      name: 'Media Tools', 
      count: 6, 
      icon: Music, 
      color: 'text-pink-600',
      description: 'Audio and video processing tools',
      growthRate: 8.9
    },
    { 
      id: 'calc', 
      name: 'Calculators', 
      count: 5, 
      icon: Calculator, 
      color: 'text-orange-600',
      description: 'Mathematical and conversion calculators',
      growthRate: 6.2
    }
  ]

  const popularTools: PopularTool[] = [
    { 
      id: '1',
      name: 'Text Formatter', 
      category: 'Text Processing', 
      usage: '2,456 uses', 
      rating: 4.8,
      icon: FileText, 
      description: 'Format and beautify text with multiple output options',
      lastUsed: '2 mins ago',
      trending: true
    },
    { 
      id: '2',
      name: 'Image Converter', 
      category: 'Image Tools', 
      usage: '1,847 uses', 
      rating: 4.9,
      icon: Image, 
      description: 'Convert images between formats with quality control',
      lastUsed: '5 mins ago',
      trending: true
    },
    { 
      id: '3',
      name: 'JSON Validator', 
      category: 'Code Utilities', 
      usage: '1,523 uses', 
      rating: 4.7,
      icon: Code2, 
      description: 'Validate and format JSON with error highlighting',
      lastUsed: '8 mins ago',
      trending: false
    },
    { 
      id: '4',
      name: 'CSV Parser', 
      category: 'Data Tools', 
      usage: '1,234 uses', 
      rating: 4.6,
      icon: Database, 
      description: 'Parse and transform CSV data with preview',
      lastUsed: '12 mins ago',
      trending: false
    },
    { 
      id: '5',
      name: 'Color Picker', 
      category: 'Design', 
      usage: '987 uses', 
      rating: 4.5,
      icon: Palette, 
      description: 'Advanced color picker with palette generation',
      lastUsed: '15 mins ago',
      trending: false
    },
    { 
      id: '6',
      name: 'Unit Converter', 
      category: 'Calculators', 
      usage: '756 uses', 
      rating: 4.4,
      icon: Calculator, 
      description: 'Convert between units with precision control',
      lastUsed: '18 mins ago',
      trending: false
    }
  ]

  const recentActivity: RecentActivity[] = [
    { 
      id: '1',
      tool: 'Text Formatter', 
      user: 'Alex Smith',
      action: 'Format text', 
      status: 'completed',
      time: '2 mins ago',
      duration: '0.8s'
    },
    { 
      id: '2',
      tool: 'Image Converter', 
      user: 'Sarah Johnson',
      action: 'Convert to WebP', 
      status: 'completed',
      time: '5 mins ago',
      duration: '1.2s'
    },
    { 
      id: '3',
      tool: 'JSON Validator', 
      user: 'Mike Chen',
      action: 'Validate JSON', 
      status: 'processing',
      time: '8 mins ago',
      duration: 'In progress'
    },
    { 
      id: '4',
      tool: 'CSV Parser', 
      user: 'Emma Wilson',
      action: 'Parse data', 
      status: 'completed',
      time: '12 mins ago',
      duration: '2.1s'
    },
    { 
      id: '5',
      tool: 'Color Picker', 
      user: 'David Brown',
      action: 'Generate palette', 
      status: 'failed',
      time: '15 mins ago',
      duration: 'Failed'
    }
  ]

  const systemStatus: SystemStatus[] = [
    { 
      name: 'Processing Engine', 
      status: 'operational', 
      uptime: '99.9%',
      responseTime: '1.2s'
    },
    { 
      name: 'API Gateway', 
      status: 'operational', 
      uptime: '99.8%',
      responseTime: '0.8s'
    },
    { 
      name: 'File Storage', 
      status: 'warning', 
      uptime: '98.5%',
      responseTime: '2.1s'
    },
    { 
      name: 'Tool Library', 
      status: 'operational', 
      uptime: '100%',
      responseTime: '0.3s'
    }
  ]

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            
            {/* Enhanced Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 p-8 text-white shadow-2xl"
            >
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <Wrench className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold mb-2">Tools Dashboard</h1>
                      <p className="text-orange-100 text-lg">AI-Powered Development Utilities & Productivity Tools</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{toolsMetrics.totalTools}</div>
                        <div className="text-orange-100 text-sm">Total Tools</div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{toolsMetrics.activeUsers}</div>
                        <div className="text-orange-100 text-sm">Active Users</div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{toolsMetrics.dailyUsage}</div>
                        <div className="text-orange-100 text-sm">Daily Usage</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-orange-100">
                        {currentTime.toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-orange-200">
                        {currentTime.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Key Metrics Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{toolsMetrics.successRate}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+2.3% from last week</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{toolsMetrics.avgProcessingTime}</div>
                    <div className="text-sm text-gray-600">Avg Processing</div>
                  </div>
                </div>
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>15% faster</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{toolsMetrics.totalProcessed}</div>
                    <div className="text-sm text-gray-600">Total Processed</div>
                  </div>
                </div>
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>+18.5% growth</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
                    <div className="text-sm text-gray-600">Tool Categories</div>
                  </div>
                </div>
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>2 new categories</span>
                </div>
              </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tools..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                  >
                    <Filter className="h-5 w-5" />
                    <span>Filters</span>
                  </button>
                  
                  <div className="flex bg-white/50 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      List
                    </button>
                    <button
                      onClick={() => setViewMode('analytics')}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'analytics' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Analytics
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Tool Categories */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Tool Categories</h3>
                    <div className="text-sm text-gray-600">{categories.length} categories</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCategories.map((category, index) => {
                      const IconComponent = category.icon
                      return (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="group p-4 bg-white/50 rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color.includes('blue') ? 'from-blue-100 to-blue-200' : 
                                category.color.includes('purple') ? 'from-purple-100 to-purple-200' :
                                category.color.includes('green') ? 'from-green-100 to-green-200' :
                                category.color.includes('indigo') ? 'from-indigo-100 to-indigo-200' :
                                category.color.includes('pink') ? 'from-pink-100 to-pink-200' :
                                'from-orange-100 to-orange-200'}`}>
                                <IconComponent className={`h-6 w-6 ${category.color}`} />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                                  {category.name}
                                </div>
                                <div className="text-sm text-gray-600">{category.count} tools</div>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-green-600 text-sm">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              <span>+{category.growthRate}%</span>
                            </div>
                            <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-xs font-medium">
                              Popular
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
                    <Activity className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="p-4 bg-white/50 rounded-xl border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{activity.tool}</h4>
                            <p className="text-xs text-gray-600">by {activity.user}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500">{activity.time}</span>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                              activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                              activity.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {activity.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {activity.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                              {activity.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                              {activity.status}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{activity.action}</p>
                        <div className="text-xs text-gray-500">
                          Duration: {activity.duration}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">System Status</h3>
                    <Cpu className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    {systemStatus.map((system, index) => (
                      <motion.div
                        key={system.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`h-3 w-3 rounded-full ${
                            system.status === 'operational' ? 'bg-green-500' :
                            system.status === 'warning' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{system.name}</div>
                            <div className="text-xs text-gray-600">Uptime: {system.uptime}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">{system.responseTime}</div>
                          <div className={`text-xs font-medium ${
                            system.status === 'operational' ? 'text-green-600' :
                            system.status === 'warning' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {system.status}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Popular Tools */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Popular Tools</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Top performers</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularTools.map((tool, index) => {
                  const IconComponent = tool.icon
                  return (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="group p-6 bg-white/50 rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl group-hover:from-orange-200 group-hover:to-red-200 transition-all duration-200">
                            <IconComponent className="h-8 w-8 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                              {tool.name}
                            </h4>
                            <p className="text-sm text-gray-600">{tool.category}</p>
                          </div>
                        </div>
                        {tool.trending && (
                          <div className="bg-red-100 text-red-800 px-2 py-1 rounded-lg text-xs font-medium">
                            Trending
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">{tool.usage}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-gray-900">{tool.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Last used: {tool.lastUsed}</span>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Modern Footer */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Zap className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Processing</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Intelligent tool recommendations and automated optimization for maximum efficiency.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Learn More
                </button>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Shield className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
                <p className="text-green-100 text-sm mb-4">
                  Bank-grade security with end-to-end encryption and compliance certifications.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Security Details
                </button>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Globe className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Global API Access</h3>
                <p className="text-purple-100 text-sm mb-4">
                  Integrate tools into your workflow with our comprehensive REST API and SDKs.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  API Docs
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}

