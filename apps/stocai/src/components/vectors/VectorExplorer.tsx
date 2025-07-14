'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Database,
  Zap,
  Eye,
  Download,
  Share2,
  MoreVertical,
  Target,
  TrendingUp,
  Clock,
  Hash
} from 'lucide-react'

interface VectorData {
  id: string
  content: string
  embedding: number[]
  metadata: {
    filename?: string
    chunk_index?: number
    document_type?: string
    created_at: string
    file_size?: number
    language?: string
    tags?: string[]
  }
  similarity?: number
}

interface VectorStats {
  totalVectors: number
  dimensions: number
  indexSize: number
  queryCount: number
  avgLatency: number
  topNamespaces: Array<{
    name: string
    count: number
  }>
}

const VectorExplorer: React.FC = () => {
  const [vectors, setVectors] = useState<VectorData[]>([])
  const [stats, setStats] = useState<VectorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [semanticQuery, setSemanticQuery] = useState('')
  const [sortBy, setSortBy] = useState<'similarity' | 'created_at' | 'file_size'>('similarity')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterNamespace, setFilterNamespace] = useState('')
  const [showEmbeddings, setShowEmbeddings] = useState(false)
  const [searchResults, setSearchResults] = useState<VectorData[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    loadVectors()
    loadStats()
  }, [filterNamespace, sortBy, sortOrder])

  const loadVectors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterNamespace) params.append('namespace', filterNamespace)
      params.append('sort', sortBy)
      params.append('order', sortOrder)
      params.append('limit', '50')
      
      const response = await fetch(`/api/vectors?${params}`)
      if (response.ok) {
        const data = await response.json()
        setVectors(data.vectors || [])
      }
    } catch (error) {
      console.error('Failed to load vectors:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Simulate loading vector statistics
      setStats({
        totalVectors: 1200000,
        dimensions: 1536,
        indexSize: 4.2 * 1024 * 1024 * 1024, // 4.2GB
        queryCount: 95000,
        avgLatency: 45,
        topNamespaces: [
          { name: 'documents', count: 450000 },
          { name: 'datasets', count: 380000 },
          { name: 'images', count: 250000 },
          { name: 'code', count: 120000 }
        ]
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const performSemanticSearch = async () => {
    if (!semanticQuery.trim()) return
    
    try {
      setIsSearching(true)
      const response = await fetch('/api/vectors/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: semanticQuery,
          limit: 20,
          namespace: filterNamespace || undefined
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const truncateText = (text: string, maxLength: number = 150): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const displayVectors = searchResults.length > 0 ? searchResults : vectors

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Vector Explorer</h1>
          <p className="text-slate-300">Browse, search, and analyze your vector embeddings</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowEmbeddings(!showEmbeddings)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showEmbeddings 
                ? 'bg-purple-500 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {showEmbeddings ? 'Hide' : 'Show'} Embeddings
          </button>
        </div>
      </div>

      {/* Vector Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Vectors</p>
              <p className="text-2xl font-bold text-white">{stats.totalVectors.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Dimensions</p>
              <p className="text-2xl font-bold text-white">{stats.dimensions}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Hash className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Index Size</p>
              <p className="text-2xl font-bold text-white">{formatFileSize(stats.indexSize)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg Latency</p>
              <p className="text-2xl font-bold text-white">{stats.avgLatency}ms</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Semantic Search */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">Semantic Search</h2>
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter semantic search query..."
              value={semanticQuery}
              onChange={(e) => setSemanticQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && performSemanticSearch()}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={performSemanticSearch}
            disabled={isSearching || !semanticQuery.trim()}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            {isSearching ? (
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <Target className="w-4 h-4" />
            )}
            <span>{isSearching ? 'Searching...' : 'Search'}</span>
          </button>
        </div>
        
        {searchResults.length > 0 && (
          <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <p className="text-purple-300 text-sm">
              Found {searchResults.length} similar vectors for "{semanticQuery}"
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Filter by content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <select
            value={filterNamespace}
            onChange={(e) => setFilterNamespace(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Namespaces</option>
            {stats.topNamespaces.map(ns => (
              <option key={ns.name} value={ns.name} className="bg-slate-800">
                {ns.name} ({ns.count.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="similarity" className="bg-slate-800">Similarity</option>
            <option value="created_at" className="bg-slate-800">Date Created</option>
            <option value="file_size" className="bg-slate-800">File Size</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Vectors List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <motion.div
            className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {displayVectors
            .filter(vector => 
              !searchQuery || 
              vector.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
              vector.metadata.filename?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((vector) => (
            <motion.div
              key={vector.id}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-white font-medium">
                      {vector.metadata.filename || `Vector ${vector.id.substring(0, 8)}`}
                    </h3>
                    {vector.similarity && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                        {(vector.similarity * 100).toFixed(1)}% match
                      </span>
                    )}
                  </div>
                  
                  <p className="text-slate-300 mb-3">
                    {truncateText(vector.content)}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {vector.metadata.document_type && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                        {vector.metadata.document_type}
                      </span>
                    )}
                    {vector.metadata.language && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                        {vector.metadata.language}
                      </span>
                    )}
                    {vector.metadata.chunk_index !== undefined && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                        Chunk {vector.metadata.chunk_index}
                      </span>
                    )}
                    {vector.metadata.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-slate-400 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(vector.metadata.created_at).toLocaleDateString()}</span>
                    </div>
                    {vector.metadata.file_size && (
                      <div className="flex items-center space-x-1">
                        <Database className="w-4 h-4" />
                        <span>{formatFileSize(vector.metadata.file_size)}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Hash className="w-4 h-4" />
                      <span>{vector.embedding.length} dimensions</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {showEmbeddings && (
                <div className="mt-4 p-4 bg-black/20 rounded-lg border border-white/10">
                  <h4 className="text-white text-sm font-medium mb-2">Embedding Vector</h4>
                  <div className="text-slate-400 text-xs font-mono max-h-20 overflow-y-auto">
                    [{vector.embedding.slice(0, 10).map(v => v.toFixed(6)).join(', ')}...]
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {displayVectors.length === 0 && !loading && (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-white text-lg font-medium mb-2">No vectors found</p>
          <p className="text-slate-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}

export default VectorExplorer
