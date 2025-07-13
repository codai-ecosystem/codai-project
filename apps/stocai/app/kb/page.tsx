'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Search,
  Plus,
  Eye,
  Edit,
  Share2,
  Bookmark,
  MessageSquare,
  Brain,
  Zap,
  Users,
  Calendar,
  Tag,
  FileText,
  Link,
  Bot
} from 'lucide-react'

interface KnowledgeBase {
  id: string
  name: string
  description: string
  category: 'general' | 'technical' | 'legal' | 'customer-support' | 'product' | 'research'
  articles: number
  documents: number
  queries: number
  lastUpdated: string
  status: 'active' | 'building' | 'archived'
  isPublic: boolean
  contributors: number
  aiEnabled: boolean
}

interface Article {
  id: string
  title: string
  excerpt: string
  category: string
  author: string
  readTime: number
  tags: string[]
  lastModified: string
  views: number
  helpful: number
}

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedKB, setSelectedKB] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'analytics'>('overview')

  const [knowledgeBases] = useState<KnowledgeBase[]>([
    {
      id: '1',
      name: 'Customer Support Hub',
      description: 'Comprehensive knowledge base for customer service representatives',
      category: 'customer-support',
      articles: 245,
      documents: 1200,
      queries: 15600,
      lastUpdated: '2024-01-20',
      status: 'active',
      isPublic: true,
      contributors: 12,
      aiEnabled: true
    },
    {
      id: '2',
      name: 'Technical Documentation',
      description: 'API documentation, development guides, and technical resources',
      category: 'technical',
      articles: 189,
      documents: 890,
      queries: 8900,
      lastUpdated: '2024-01-19',
      status: 'active',
      isPublic: false,
      contributors: 8,
      aiEnabled: true
    },
    {
      id: '3',
      name: 'Product Knowledge Center',
      description: 'Product features, specifications, and user guides',
      category: 'product',
      articles: 156,
      documents: 650,
      queries: 12300,
      lastUpdated: '2024-01-18',
      status: 'active',
      isPublic: true,
      contributors: 6,
      aiEnabled: false
    },
    {
      id: '4',
      name: 'Legal & Compliance',
      description: 'Legal documents, policies, and compliance guidelines',
      category: 'legal',
      articles: 78,
      documents: 340,
      queries: 2100,
      lastUpdated: '2024-01-17',
      status: 'active',
      isPublic: false,
      contributors: 4,
      aiEnabled: true
    },
    {
      id: '5',
      name: 'Research Repository',
      description: 'Research papers, case studies, and academic resources',
      category: 'research',
      articles: 234,
      documents: 1500,
      queries: 5600,
      lastUpdated: '2024-01-16',
      status: 'building',
      isPublic: false,
      contributors: 15,
      aiEnabled: true
    }
  ])

  const [recentArticles] = useState<Article[]>([
    {
      id: '1',
      title: 'How to Reset Your Account Password',
      excerpt: 'Step-by-step guide for resetting forgotten passwords and updating security settings',
      category: 'Account Management',
      author: 'Sarah Johnson',
      readTime: 3,
      tags: ['password', 'security', 'account'],
      lastModified: '2024-01-20',
      views: 1240,
      helpful: 45
    },
    {
      id: '2',
      title: 'API Authentication Best Practices',
      excerpt: 'Learn about secure API authentication methods and implementation guidelines',
      category: 'Development',
      author: 'Mike Chen',
      readTime: 8,
      tags: ['api', 'authentication', 'security'],
      lastModified: '2024-01-19',
      views: 890,
      helpful: 32
    },
    {
      id: '3',
      title: 'Understanding Our Privacy Policy',
      excerpt: 'Comprehensive overview of data collection, usage, and user privacy rights',
      category: 'Legal',
      author: 'Jennifer Davis',
      readTime: 12,
      tags: ['privacy', 'legal', 'gdpr'],
      lastModified: '2024-01-18',
      views: 567,
      helpful: 28
    },
    {
      id: '4',
      title: 'Feature Release: Advanced Search',
      excerpt: 'New search capabilities with filters, sorting, and AI-powered suggestions',
      category: 'Product Updates',
      author: 'Alex Rodriguez',
      readTime: 5,
      tags: ['features', 'search', 'updates'],
      lastModified: '2024-01-17',
      views: 2100,
      helpful: 67
    }
  ])

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'customer-support': 'text-blue-400 bg-blue-400/20',
      'technical': 'text-green-400 bg-green-400/20',
      'legal': 'text-red-400 bg-red-400/20',
      'product': 'text-purple-400 bg-purple-400/20',
      'research': 'text-yellow-400 bg-yellow-400/20',
      'general': 'text-gray-400 bg-gray-400/20'
    }
    return colors[category] || colors.general
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'building': return 'text-yellow-400 bg-yellow-400/20'
      case 'archived': return 'text-gray-400 bg-gray-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const filteredKBs = knowledgeBases.filter(kb =>
    kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kb.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Knowledge Base
          </h1>
          <p className="text-gray-400">Organize and share knowledge with AI-powered search and discovery</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-white">{knowledgeBases.length}</p>
                <p className="text-sm text-gray-400">Knowledge Bases</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {knowledgeBases.reduce((sum, kb) => sum + kb.articles, 0)}
                </p>
                <p className="text-sm text-gray-400">Total Articles</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <Search className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {knowledgeBases.reduce((sum, kb) => sum + kb.queries, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Search Queries</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {knowledgeBases.filter(kb => kb.aiEnabled).length}
                </p>
                <p className="text-sm text-gray-400">AI-Enabled</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex justify-center space-x-1 bg-white/5 backdrop-blur-lg rounded-2xl p-1 max-w-lg mx-auto border border-white/10">
            {(['overview', 'articles', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab
                  ? 'bg-emerald-500/30 text-emerald-300 shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Search and Actions */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search knowledge bases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Knowledge Base
                </button>
              </div>
            </div>

            {/* Knowledge Bases Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredKBs.map((kb, index) => (
                <motion.div
                  key={kb.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-8 h-8 text-emerald-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{kb.name}</h3>
                        <p className="text-sm text-gray-400">{kb.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {kb.aiEnabled && (
                        <div title="AI-Enabled">
                          <Brain className="w-4 h-4 text-purple-400" />
                        </div>
                      )}
                      {kb.isPublic && (
                        <div title="Public">
                          <Share2 className="w-4 h-4 text-green-400" />
                        </div>
                      )}
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(kb.status)}`}>
                        {kb.status}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Articles</p>
                      <p className="text-sm font-medium text-white">{kb.articles}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Documents</p>
                      <p className="text-sm font-medium text-white">{kb.documents}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Queries</p>
                      <p className="text-sm font-medium text-white">{kb.queries.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Contributors</p>
                      <p className="text-sm font-medium text-white">{kb.contributors}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(kb.category)} w-fit`}>
                      {kb.category.replace('-', ' ')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">Updated {kb.lastUpdated}</p>
                    <div className="flex items-center gap-2">
                      <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors">
                        <Search className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'articles' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Recent Articles</h2>
              <div className="space-y-4">
                {recentArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{article.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{article.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>{article.category}</span>
                          <span>By {article.author}</span>
                          <span>{article.readTime} min read</span>
                          <span>{article.views} views</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <div className="flex items-center gap-1 text-green-400">
                          <MessageSquare className="w-3 h-3" />
                          <span className="text-xs">{article.helpful}</span>
                        </div>
                        <button className="p-1 hover:bg-white/10 rounded transition-colors">
                          <Bookmark className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {article.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-lg"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">Modified {article.lastModified}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
          >
            <Brain className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">Knowledge Analytics</h2>
            <p className="text-gray-300 mb-6">
              Insights into knowledge base usage, popular content, and search patterns.
            </p>
            <button className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all font-medium">
              Coming Soon
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
