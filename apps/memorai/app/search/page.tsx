'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MemorAILayout from '../../components/layout/MemorAILayout'
import MemorAIService from '../../services/memoraiService'
import {
  Search,
  Filter,
  Clock,
  Star,
  Tag,
  Zap,
  Brain,
  TrendingUp,
  ChevronRight,
  BookOpen,
  Lightbulb,
  Target,
  Eye,
  ArrowRight,
  SlidersHorizontal,
  Calendar,
  Hash,
  FileText,
  Users,
  Code,
  Sparkles,
  X,
  History
} from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  content: string
  type: string
  importance: number
  relevanceScore: number
  tags: string[]
  connections: number
  timestamp: string
  highlights: string[]
}

interface SearchFilters {
  types: string[]
  dateRange: {
    start: string
    end: string
  }
  importanceMin: number
  tagsInclude: string[]
  tagsExclude: string[]
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    types: [],
    dateRange: { start: '', end: '' },
    importanceMin: 0,
    tagsInclude: [],
    tagsExclude: []
  })
  const [searchMode, setSearchMode] = useState<'semantic' | 'exact' | 'fuzzy'>('semantic')

  const memoraiService = MemorAIService.getInstance()

  const searchModes = [
    {
      value: 'semantic',
      label: 'Semantic Search',
      description: 'AI-powered meaning-based search',
      icon: Brain,
      color: 'from-purple-500 to-pink-500'
    },
    {
      value: 'exact',
      label: 'Exact Match',
      description: 'Find exact word or phrase matches',
      icon: Target,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      value: 'fuzzy',
      label: 'Fuzzy Search',
      description: 'Flexible matching with typo tolerance',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-500'
    }
  ]

  const popularSearches = [
    'meeting notes from last week',
    'project documentation',
    'code snippets for authentication',
    'research findings',
    'creative ideas',
    'architecture decisions'
  ]

  useEffect(() => {
    loadSearchHistory()
    loadSuggestions()
  }, [])

  useEffect(() => {
    if (query.length > 2) {
      const timeoutId = setTimeout(() => {
        generateSuggestions(query)
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [query])

  const loadSearchHistory = async () => {
    try {
      const history = await memoraiService.getSearchHistory()
      setSearchHistory(history.slice(0, 10))
    } catch (error) {
      console.error('Failed to load search history:', error)
    }
  }

  const loadSuggestions = async () => {
    try {
      const suggestions = await memoraiService.getSearchSuggestions()
      setSuggestions(suggestions.slice(0, 5))
    } catch (error) {
      console.error('Failed to load suggestions:', error)
    }
  }

  const generateSuggestions = async (searchQuery: string) => {
    try {
      const suggestions = await memoraiService.generateSearchSuggestions(searchQuery)
      setSuggestions(suggestions)
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
    }
  }

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const searchResults = await memoraiService.searchMemories({
        query: searchQuery,
        mode: searchMode,
        filters,
        limit: 50
      })

      setResults(searchResults)
      setHasSearched(true)

      // Add to search history
      await memoraiService.addToSearchHistory(searchQuery)
      setSearchHistory(prev => [searchQuery, ...prev.filter(h => h !== searchQuery)].slice(0, 10))

    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return Users
      case 'research': return FileText
      case 'code': return Code
      case 'idea': return Lightbulb
      case 'document': return FileText
      default: return Brain
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-gradient-to-r from-blue-500 to-cyan-500'
      case 'research': return 'bg-gradient-to-r from-purple-500 to-pink-500'
      case 'code': return 'bg-gradient-to-r from-emerald-500 to-teal-500'
      case 'idea': return 'bg-gradient-to-r from-yellow-500 to-orange-500'
      case 'document': return 'bg-gradient-to-r from-red-500 to-pink-500'
      default: return 'bg-gradient-to-r from-slate-500 to-slate-600'
    }
  }

  const highlightText = (text: string, highlights: string[]) => {
    if (!highlights.length) return text

    let highlightedText = text
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-300 text-yellow-900 px-1 rounded">$1</mark>')
    })

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />
  }

  return (
    <MemorAILayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Memory Search 🔍
          </h1>
          <p className="text-slate-300 text-lg">
            Find anything in your knowledge repository with AI-powered search
          </p>
        </motion.div>

        {/* Search Modes */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl rounded-xl p-2 border border-white/20">
            {searchModes.map((mode) => {
              const Icon = mode.icon
              return (
                <button
                  key={mode.value}
                  onClick={() => setSearchMode(mode.value as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${searchMode === mode.value
                      ? `bg-gradient-to-r ${mode.color} text-white`
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{mode.label}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search your memories, documents, notes, and more..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-16 pr-32 py-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-purple-500 text-white' : 'bg-white/10 text-slate-400 hover:text-white'
                    }`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                >
                  {isSearching ? (
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            </div>

            {/* Search Suggestions */}
            <AnimatePresence>
              {query.length > 0 && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 z-10"
                >
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(suggestion)
                          handleSearch(suggestion)
                        }}
                        className="flex items-center space-x-3 w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Search className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Quick Searches & History */}
        {!hasSearched && (
          <motion.div
            className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Popular Searches */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
                Popular Searches
              </h3>
              <div className="space-y-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search)
                      handleSearch(search)
                    }}
                    className="flex items-center justify-between w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <span className="text-slate-300">{search}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Search History */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                <History className="w-5 h-5 mr-2 text-blue-400" />
                Recent Searches
              </h3>
              {searchHistory.length > 0 ? (
                <div className="space-y-2">
                  {searchHistory.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(search)
                        handleSearch(search)
                      }}
                      className="flex items-center justify-between w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors group"
                    >
                      <span className="text-slate-300">{search}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No recent searches</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-slate-300">
                {isSearching ? (
                  <span>Searching...</span>
                ) : (
                  <span>
                    Found {results.length} results for "{query}"
                  </span>
                )}
              </div>

              {results.length > 0 && (
                <div className="text-sm text-slate-400">
                  Sorted by relevance
                </div>
              )}
            </div>

            {/* Results List */}
            {results.length === 0 && !isSearching ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-slate-400 mb-6">
                  Try different keywords or adjust your search filters
                </p>
                <button
                  onClick={() => setShowFilters(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Adjust Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => {
                  const TypeIcon = getTypeIcon(result.type)
                  return (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 ${getTypeColor(result.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <TypeIcon className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-white font-semibold text-lg group-hover:text-purple-300 transition-colors">
                              {highlightText(result.title, result.highlights)}
                            </h3>
                            <div className="flex items-center space-x-2 ml-4">
                              <div className="flex items-center space-x-1 text-sm text-yellow-400">
                                <Star className="w-4 h-4" />
                                <span>{Math.round(result.relevanceScore * 100)}%</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-slate-300 mb-4 line-clamp-3">
                            {highlightText(result.content, result.highlights)}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-slate-400">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatTimestamp(result.timestamp)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4" />
                                <span>{(result.importance * 100).toFixed(0)}%</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Hash className="w-4 h-4" />
                                <span>{result.tags.length} tags</span>
                              </div>
                            </div>

                            <button className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 transition-colors">
                              <span className="text-sm font-medium">View</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </MemorAILayout>
  )
}
