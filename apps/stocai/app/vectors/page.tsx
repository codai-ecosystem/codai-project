'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  Search,
  Filter,
  Plus,
  Eye,
  Download,
  Zap,
  Layers,
  BarChart3,
  Activity,
  RefreshCw,
  GitBranch,
  Target,
  Database
} from 'lucide-react'

interface VectorIndex {
  id: string
  name: string
  description: string
  dimension: number
  metric: 'cosine' | 'euclidean' | 'dotproduct'
  vectors: number
  namespace: string
  created: string
  lastUpdated: string
  status: 'active' | 'building' | 'error'
  usage: {
    queries: number
    storage: string
  }
}

interface VectorQuery {
  id: string
  query: string
  similarity: number
  timestamp: string
  namespace: string
}

export default function VectorsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'indexes' | 'queries' | 'analytics'>('indexes')

  const [vectorIndexes] = useState<VectorIndex[]>([
    {
      id: '1',
      name: 'Document Embeddings',
      description: 'OpenAI embeddings for document search and RAG applications',
      dimension: 1536,
      metric: 'cosine',
      vectors: 125000,
      namespace: 'documents',
      created: '2024-01-15',
      lastUpdated: '2024-01-20',
      status: 'active',
      usage: {
        queries: 45000,
        storage: '2.3 GB'
      }
    },
    {
      id: '2',
      name: 'Customer Support KB',
      description: 'Knowledge base embeddings for customer support automation',
      dimension: 768,
      metric: 'cosine',
      vectors: 85000,
      namespace: 'support',
      created: '2024-01-12',
      lastUpdated: '2024-01-19',
      status: 'active',
      usage: {
        queries: 28000,
        storage: '1.8 GB'
      }
    },
    {
      id: '3',
      name: 'Product Catalog',
      description: 'Product description embeddings for semantic search',
      dimension: 512,
      metric: 'cosine',
      vectors: 250000,
      namespace: 'products',
      created: '2024-01-10',
      lastUpdated: '2024-01-18',
      status: 'active',
      usage: {
        queries: 120000,
        storage: '4.1 GB'
      }
    },
    {
      id: '4',
      name: 'Legal Documents',
      description: 'Legal document embeddings for case law search',
      dimension: 1536,
      metric: 'cosine',
      vectors: 45000,
      namespace: 'legal',
      created: '2024-01-08',
      lastUpdated: '2024-01-16',
      status: 'building',
      usage: {
        queries: 8500,
        storage: '1.2 GB'
      }
    },
    {
      id: '5',
      name: 'Research Papers',
      description: 'Academic paper embeddings for research discovery',
      dimension: 1024,
      metric: 'cosine',
      vectors: 180000,
      namespace: 'research',
      created: '2024-01-05',
      lastUpdated: '2024-01-15',
      status: 'active',
      usage: {
        queries: 65000,
        storage: '3.5 GB'
      }
    }
  ])

  const [recentQueries] = useState<VectorQuery[]>([
    {
      id: '1',
      query: 'customer payment issues resolution',
      similarity: 0.92,
      timestamp: '2024-01-20 14:30',
      namespace: 'support'
    },
    {
      id: '2',
      query: 'artificial intelligence machine learning',
      similarity: 0.89,
      timestamp: '2024-01-20 14:25',
      namespace: 'research'
    },
    {
      id: '3',
      query: 'privacy policy gdpr compliance',
      similarity: 0.87,
      timestamp: '2024-01-20 14:20',
      namespace: 'legal'
    },
    {
      id: '4',
      query: 'wireless bluetooth headphones review',
      similarity: 0.94,
      timestamp: '2024-01-20 14:15',
      namespace: 'products'
    },
    {
      id: '5',
      query: 'document classification methods',
      similarity: 0.91,
      timestamp: '2024-01-20 14:10',
      namespace: 'documents'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'building': return 'text-yellow-400 bg-yellow-400/20'
      case 'error': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'cosine': return <Target className="w-4 h-4" />
      case 'euclidean': return <BarChart3 className="w-4 h-4" />
      case 'dotproduct': return <Activity className="w-4 h-4" />
      default: return <Database className="w-4 h-4" />
    }
  }

  const filteredIndexes = vectorIndexes.filter(index =>
    index.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    index.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    index.namespace.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Vector Database
          </h1>
          <p className="text-gray-400">Manage vector embeddings for semantic search and AI applications</p>
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
              <Brain className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{vectorIndexes.length}</p>
                <p className="text-sm text-gray-400">Vector Indexes</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <Layers className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {vectorIndexes.reduce((sum, idx) => sum + idx.vectors, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total Vectors</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <Search className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {vectorIndexes.reduce((sum, idx) => sum + idx.usage.queries, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total Queries</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {vectorIndexes.filter(idx => idx.status === 'active').length}
                </p>
                <p className="text-sm text-gray-400">Active Indexes</p>
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
            {(['indexes', 'queries', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab
                  ? 'bg-purple-500/30 text-purple-300 shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content based on active tab */}
        {activeTab === 'indexes' && (
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
                    placeholder="Search vector indexes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-colors">
                    <Filter className="w-4 h-4" />
                  </button>
                  <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Index
                  </button>
                </div>
              </div>
            </div>

            {/* Vector Indexes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredIndexes.map((index, i) => (
                <motion.div
                  key={index.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Brain className="w-8 h-8 text-purple-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{index.name}</h3>
                        <p className="text-sm text-gray-400">{index.description}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(index.status)}`}>
                      {index.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Dimension</p>
                      <p className="text-sm font-medium text-white">{index.dimension}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Vectors</p>
                      <p className="text-sm font-medium text-white">{index.vectors.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Metric</p>
                      <div className="flex items-center gap-1">
                        {getMetricIcon(index.metric)}
                        <p className="text-sm font-medium text-white">{index.metric}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Namespace</p>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-lg">
                        {index.namespace}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400">Queries</p>
                        <p className="text-sm font-medium text-white">{index.usage.queries.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Storage</p>
                        <p className="text-sm font-medium text-white">{index.usage.storage}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">Updated {index.lastUpdated}</p>
                      <div className="flex items-center gap-2">
                        <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors">
                          <Search className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'queries' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Recent Vector Queries</h2>
            <div className="space-y-4">
              {recentQueries.map((query, index) => (
                <motion.div
                  key={query.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium mb-1">{query.query}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Similarity: {(query.similarity * 100).toFixed(1)}%</span>
                        <span>Namespace: {query.namespace}</span>
                        <span>{query.timestamp}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-16 bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${query.similarity * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-purple-400 font-medium ml-2">
                        {(query.similarity * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
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
            <BarChart3 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-purple-400 mb-4">Vector Analytics</h2>
            <p className="text-gray-300 mb-6">
              Advanced analytics for vector performance, query patterns, and usage insights.
            </p>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium">
              Coming Soon
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
