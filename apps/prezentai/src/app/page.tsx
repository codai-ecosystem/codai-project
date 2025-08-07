'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Monitor, 
  BarChart3, 
  Users, 
  FileText, 
  Presentation, 
  Palette, 
  Share2, 
  Download, 
  Play, 
  Edit3, 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Clock, 
  Eye, 
  Heart, 
  MoreVertical, 
  Copy, 
  Trash2, 
  Star, 
  Folder, 
  Settings, 
  Zap, 
  Camera, 
  Video, 
  Image, 
  Mic, 
  Layout, 
  Type, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  Bell,
  Award,
  Target,
  Activity,
  Globe,
  Shield,
  RefreshCw
} from 'lucide-react'

interface PresentationMetric {
  id: string
  name: string
  value: string
  change: number
  changeType: 'increase' | 'decrease' | 'stable'
  icon: React.ComponentType<any>
  color: string
}

interface Presentation {
  id: string
  title: string
  thumbnail: string
  slides: number
  duration: string
  status: 'draft' | 'published' | 'shared' | 'archived'
  lastModified: string
  views: number
  likes: number
  collaborators: number
  tags: string[]
  template: string
  format: 'standard' | 'widescreen' | 'custom'
  isStarred: boolean
  shareUrl?: string
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  action: () => void
}

const overviewMetrics: PresentationMetric[] = [
  { 
    id: 'total-presentations', 
    name: 'Total Presentations', 
    value: '47', 
    change: 12, 
    changeType: 'increase', 
    icon: Presentation, 
    color: 'text-blue-400' 
  },
  { 
    id: 'total-views', 
    name: 'Total Views', 
    value: '12.8K', 
    change: 24, 
    changeType: 'increase', 
    icon: Eye, 
    color: 'text-green-400' 
  },
  { 
    id: 'avg-engagement', 
    name: 'Avg Engagement', 
    value: '85%', 
    change: 8, 
    changeType: 'increase', 
    icon: TrendingUp, 
    color: 'text-purple-400' 
  },
  { 
    id: 'templates-used', 
    name: 'Templates Used', 
    value: '23', 
    change: 5, 
    changeType: 'increase', 
    icon: Layout, 
    color: 'text-orange-400' 
  },
  { 
    id: 'shared-presentations', 
    name: 'Shared This Month', 
    value: '18', 
    change: 15, 
    changeType: 'increase', 
    icon: Share2, 
    color: 'text-pink-400' 
  },
  { 
    id: 'collaboration-score', 
    name: 'Collaboration Score', 
    value: '92%', 
    change: 3, 
    changeType: 'increase', 
    icon: Users, 
    color: 'text-indigo-400' 
  }
]

const mockPresentations: Presentation[] = [
  {
    id: 'pres-001',
    title: 'Q4 Business Review',
    thumbnail: '/api/placeholder/300/200',
    slides: 24,
    duration: '15 min',
    status: 'published',
    lastModified: '2025-08-07 10:30:00',
    views: 156,
    likes: 23,
    collaborators: 3,
    tags: ['business', 'quarterly', 'review'],
    template: 'Corporate Blue',
    format: 'widescreen',
    isStarred: true,
    shareUrl: 'https://prezentai.com/share/pres-001'
  },
  {
    id: 'pres-002',
    title: 'Product Launch Strategy',
    thumbnail: '/api/placeholder/300/200',
    slides: 32,
    duration: '25 min',
    status: 'draft',
    lastModified: '2025-08-07 09:15:00',
    views: 45,
    likes: 8,
    collaborators: 5,
    tags: ['product', 'strategy', 'launch'],
    template: 'Modern Gradient',
    format: 'widescreen',
    isStarred: false
  },
  {
    id: 'pres-003',
    title: 'Team Training: AI Tools',
    thumbnail: '/api/placeholder/300/200',
    slides: 18,
    duration: '20 min',
    status: 'shared',
    lastModified: '2025-08-06 16:45:00',
    views: 89,
    likes: 34,
    collaborators: 2,
    tags: ['training', 'ai', 'tools'],
    template: 'Tech Dark',
    format: 'standard',
    isStarred: true,
    shareUrl: 'https://prezentai.com/share/pres-003'
  },
  {
    id: 'pres-004',
    title: 'Market Analysis Report',
    thumbnail: '/api/placeholder/300/200',
    slides: 28,
    duration: '18 min',
    status: 'published',
    lastModified: '2025-08-06 14:20:00',
    views: 67,
    likes: 12,
    collaborators: 4,
    tags: ['market', 'analysis', 'report'],
    template: 'Professional White',
    format: 'widescreen',
    isStarred: false
  },
  {
    id: 'pres-005',
    title: 'Creative Campaign Ideas',
    thumbnail: '/api/placeholder/300/200',
    slides: 15,
    duration: '12 min',
    status: 'draft',
    lastModified: '2025-08-05 11:30:00',
    views: 23,
    likes: 5,
    collaborators: 6,
    tags: ['creative', 'campaign', 'ideas'],
    template: 'Creative Colorful',
    format: 'standard',
    isStarred: false
  },
  {
    id: 'pres-006',
    title: 'Financial Planning 2025',
    thumbnail: '/api/placeholder/300/200',
    slides: 35,
    duration: '30 min',
    status: 'archived',
    lastModified: '2025-08-04 09:00:00',
    views: 134,
    likes: 28,
    collaborators: 3,
    tags: ['financial', 'planning', '2025'],
    template: 'Finance Pro',
    format: 'widescreen',
    isStarred: true
  }
]

const quickActions: QuickAction[] = [
  {
    id: 'create-blank',
    title: 'Create Blank',
    description: 'Start with a blank presentation',
    icon: Plus,
    color: 'from-blue-500 to-blue-600',
    action: () => console.log('Create blank presentation')
  },
  {
    id: 'browse-templates',
    title: 'Browse Templates',
    description: 'Choose from 500+ templates',
    icon: Layout,
    color: 'from-purple-500 to-purple-600',
    action: () => console.log('Browse templates')
  },
  {
    id: 'import-slides',
    title: 'Import Slides',
    description: 'Import from PowerPoint or PDF',
    icon: Download,
    color: 'from-green-500 to-green-600',
    action: () => console.log('Import slides')
  },
  {
    id: 'ai-presenter',
    title: 'AI Presenter',
    description: 'Generate with AI assistance',
    icon: Zap,
    color: 'from-orange-500 to-orange-600',
    action: () => console.log('AI presenter')
  },
  {
    id: 'team-workspace',
    title: 'Team Workspace',
    description: 'Collaborate with team',
    icon: Users,
    color: 'from-pink-500 to-pink-600',
    action: () => console.log('Team workspace')
  },
  {
    id: 'media-library',
    title: 'Media Library',
    description: 'Access stock photos & videos',
    icon: Image,
    color: 'from-indigo-500 to-indigo-600',
    action: () => console.log('Media library')
  },
  {
    id: 'analytics-hub',
    title: 'Analytics Hub',
    description: 'View presentation insights',
    icon: BarChart3,
    color: 'from-teal-500 to-teal-600',
    action: () => console.log('Analytics hub')
  },
  {
    id: 'brand-kit',
    title: 'Brand Kit',
    description: 'Manage brand assets',
    icon: Palette,
    color: 'from-red-500 to-red-600',
    action: () => console.log('Brand kit')
  }
]

export default function PrezentAIDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPresentations, setSelectedPresentations] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('lastModified')

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      published: 'bg-green-500/20 text-green-300 border-green-500/30',
      shared: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      archived: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const filteredPresentations = mockPresentations.filter(presentation => {
    const matchesSearch = presentation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         presentation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || presentation.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handlePresentationSelect = (presentationId: string) => {
    setSelectedPresentations(prev => 
      prev.includes(presentationId) 
        ? prev.filter(id => id !== presentationId)
        : [...prev, presentationId]
    )
  }

  const handleStarToggle = (presentationId: string) => {
    // In a real app, this would update the presentation in the backend
    console.log('Toggle star for presentation:', presentationId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-purple-700/50 bg-purple-900/30 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">PrezentAI Dashboard</h1>
              <p className="text-purple-200">Create, manage, and share stunning presentations</p>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Presentation</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overview Metrics */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
        >
          {overviewMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-purple-800/30 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                  <div className={`flex items-center space-x-1 text-sm ${
                    metric.changeType === 'increase' ? 'text-green-400' :
                    metric.changeType === 'decrease' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    <span>+{metric.change}%</span>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-purple-200 mb-1">{metric.name}</h3>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-800/30 backdrop-blur-sm border border-purple-700/50 rounded-xl mb-6"
        >
          <div className="flex space-x-1 p-1">
            {[
              { id: 'overview', label: 'Overview', icon: Monitor },
              { id: 'presentations', label: 'Presentations', icon: Presentation },
              { id: 'templates', label: 'Templates', icon: Layout },
              { id: 'media', label: 'Media Library', icon: Image },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-purple-200 hover:text-white hover:bg-purple-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={action.action}
                  className={`p-6 bg-gradient-to-br ${action.color} rounded-xl text-white text-left hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                >
                  <Icon className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-800/30 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search presentations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-purple-700/50 border border-purple-600/50 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-purple-700/50 border border-purple-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="shared">Shared</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-purple-700/50 border border-purple-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="lastModified">Last Modified</option>
                <option value="title">Title</option>
                <option value="views">Views</option>
                <option value="likes">Likes</option>
              </select>

              <div className="flex bg-purple-700/50 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-purple-300'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-purple-300'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Presentations Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-800/30 backdrop-blur-sm border border-purple-700/50 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Presentations</h2>
            {selectedPresentations.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-purple-200 text-sm">{selectedPresentations.length} selected</span>
                <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors">
                  Share
                </button>
                <button className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition-colors">
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredPresentations.map((presentation) => (
              <motion.div
                key={presentation.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-purple-700/30 border border-purple-600/50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <Presentation className="w-16 h-16 text-white/50" />
                  </div>
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedPresentations.includes(presentation.id)}
                      onChange={() => handlePresentationSelect(presentation.id)}
                      className="rounded border-purple-600 bg-purple-700/50 text-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleStarToggle(presentation.id)}
                      className={`p-1 rounded ${presentation.isStarred ? 'text-yellow-400' : 'text-white/50 hover:text-white'}`}
                    >
                      <Star className="w-4 h-4" fill={presentation.isStarred ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs border ${getStatusBadge(presentation.status)}`}>
                      {presentation.status}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-white font-medium mb-2">{presentation.title}</h3>
                  <div className="flex items-center justify-between text-sm text-purple-300 mb-3">
                    <span>{presentation.slides} slides • {presentation.duration}</span>
                    <span>{presentation.format}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-purple-300 mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{presentation.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{presentation.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{presentation.collaborators}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {presentation.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-purple-600/30 text-purple-200 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-400">
                      {new Date(presentation.lastModified).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-purple-300 hover:text-white transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-purple-300 hover:text-white transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-purple-300 hover:text-white transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-purple-300 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredPresentations.length === 0 && (
            <div className="text-center py-12">
              <Presentation className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No presentations found</h3>
              <p className="text-purple-300">Try adjusting your search criteria or create a new presentation.</p>
            </div>
          )}
        </motion.div>

        {/* Modern Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-purple-300"
        >
          <div className="flex items-center justify-center space-x-6 mb-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm">AI-powered design</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-sm">Secure collaboration</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="text-sm">Global sharing</span>
            </div>
          </div>
          <p className="text-sm">&copy; 2025 PrezentAI Platform. Professional presentation creation and management.</p>
        </motion.footer>
      </div>
    </div>
  )
}
