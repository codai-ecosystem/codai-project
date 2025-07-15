'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MemorAILayout from '../../components/layout/MemorAILayout'
import SearchBar from '../../components/search/SearchBar'
import SearchResults from '../../components/search/SearchResults'
import { SearchResult, advancedSearch } from '../../lib/search/advanced-search'
import { logUser, logSearch } from '../../lib/logger'
import {
  Search,
  TrendingUp,
  ArrowRight,
  History,
  Brain,
  Target,
  Sparkles,
  Users,
  FileText,
  Code,
  Lightbulb,
  BookOpen
} from 'lucide-react'

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [searchMode, setSearchMode] = useState<'semantic' | 'exact' | 'fuzzy'>('semantic')

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
    'AI memory architecture patterns',
    'machine learning best practices',
    'database optimization strategies',
    'user interface design guidelines',
    'API security implementation',
    'React performance optimization'
  ]

  // Initialize search engine with sample data
  useEffect(() => {
    const initializeSearch = async () => {
      try {
        // Sample search data for demonstration
        const sampleData: SearchResult[] = [
          {
            id: '1',
            title: 'AI Memory Architecture Patterns',
            content: 'Comprehensive guide to designing memory systems for AI applications. Covers vector databases, semantic search, and real-time indexing strategies for optimal performance.',
            type: 'knowledge',
            score: 0,
            highlights: [],
            metadata: {
              tags: ['ai', 'memory', 'architecture', 'patterns'],
              author: 'System',
              category: 'technical'
            },
            createdAt: new Date('2024-12-30'),
            updatedAt: new Date('2024-12-31')
          },
          {
            id: '2',
            title: 'Project Meeting Notes - Q4 Review',
            content: 'Important meeting discussing quarterly performance metrics, team objectives, and next phase planning. Key decisions made regarding resource allocation and timeline adjustments.',
            type: 'note',
            score: 0,
            highlights: [],
            metadata: {
              tags: ['meeting', 'q4', 'review', 'planning'],
              author: 'Team Lead',
              category: 'business'
            },
            createdAt: new Date('2024-12-29'),
            updatedAt: new Date('2024-12-29')
          },
          {
            id: '3',
            title: 'Machine Learning Best Practices',
            content: 'Collection of proven strategies for ML model development, including data preprocessing, feature engineering, model selection, and performance optimization techniques.',
            type: 'document',
            score: 0,
            highlights: [],
            metadata: {
              tags: ['machine-learning', 'best-practices', 'optimization'],
              author: 'ML Team',
              category: 'technical'
            },
            createdAt: new Date('2024-12-28'),
            updatedAt: new Date('2024-12-30')
          },
          {
            id: '4',
            title: 'Customer Feedback Analysis',
            content: 'Analysis of customer feedback from the past quarter reveals key insights into user satisfaction, feature requests, and areas for improvement in our platform.',
            type: 'memory',
            score: 0,
            highlights: [],
            metadata: {
              tags: ['customer', 'feedback', 'analysis', 'insights'],
              author: 'Product Team',
              category: 'business'
            },
            createdAt: new Date('2024-12-27'),
            updatedAt: new Date('2024-12-28')
          },
          {
            id: '5',
            title: 'Database Optimization Strategies',
            content: 'Technical documentation covering database performance tuning, query optimization, indexing strategies, and scaling approaches for high-traffic applications.',
            type: 'knowledge',
            score: 0,
            highlights: [],
            metadata: {
              tags: ['database', 'optimization', 'performance', 'scaling'],
              author: 'DevOps Team',
              category: 'technical'
            },
            createdAt: new Date('2024-12-26'),
            updatedAt: new Date('2024-12-27')
          },
          {
            id: '6',
            title: 'User Interface Design Guidelines',
            content: 'Comprehensive design system documentation including component guidelines, color schemes, typography rules, and interaction patterns for consistent user experience.',
            type: 'document',
            score: 0,
            highlights: [],
            metadata: {
              tags: ['ui', 'design', 'guidelines', 'components'],
              author: 'Design Team',
              category: 'design'
            },
            createdAt: new Date('2024-12-25'),
            updatedAt: new Date('2024-12-26')
          },
          {
            id: '7',
            title: 'API Security Implementation',
            content: 'Security best practices for REST API development including authentication strategies, input validation, rate limiting, and vulnerability protection measures.',
            type: 'memory',
            score: 0,
            highlights: [],
            metadata: {
              tags: ['api', 'security', 'authentication', 'protection'],
              author: 'Security Team',
              category: 'security'
            },
            createdAt: new Date('2024-12-24'),
            updatedAt: new Date('2024-12-25')
          },
          {
            id: '8',
            title: 'React Performance Optimization',
            content: 'Advanced techniques for optimizing React applications including component memoization, lazy loading, bundle splitting, and runtime performance monitoring.',
            type: 'knowledge',
            score: 0,
            highlights: [],
            metadata: {
              tags: ['react', 'performance', 'optimization', 'frontend'],
              author: 'Frontend Team',
              category: 'technical'
            },
            createdAt: new Date('2024-12-23'),
            updatedAt: new Date('2024-12-24')
          }
        ]

        // Add sample data to search index
        await advancedSearch.addToIndex(sampleData)

        await logUser('search-engine-initialized', {
          context: {
            sampleDataCount: sampleData.length,
            analytics: advancedSearch.getAnalytics()
          }
        })

      } catch (error) {
        console.error('Failed to initialize search:', error)
      }
    }

    initializeSearch()
    loadSearchHistory()
  }, [])

  const loadSearchHistory = () => {
    const history = localStorage.getItem('memorai-search-history')
    if (history) {
      try {
        setSearchHistory(JSON.parse(history).slice(0, 6))
      } catch (error) {
        console.error('Failed to load search history:', error)
      }
    }
  }

  const addToSearchHistory = (searchQuery: string) => {
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('memorai-search-history', JSON.stringify(newHistory))
  }

  const handleSearch = async (results: SearchResult[]) => {
    setSearchResults(results)
    setHasSearched(true)
    if (query.trim()) {
      addToSearchHistory(query.trim())
    }
  }

  const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading)
  }

  const handleQuickSearch = async (searchQuery: string) => {
    setQuery(searchQuery)
    setLoading(true)
    try {
      const results = await advancedSearch.search(searchQuery, {
        type: 'all',
        maxResults: 50,
        sortBy: 'relevance'
      })
      setSearchResults(results)
      setHasSearched(true)
      addToSearchHistory(searchQuery)

      await logSearch('quick-search', searchQuery, results.length, 0, {
        module: 'search-page'
      })
    } catch (error) {
      console.error('Quick search failed:', error)
    } finally {
      setLoading(false)
    }
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
            Advanced Memory Search 🔍
          </h1>
          <p className="text-slate-300 text-lg">
            AI-powered semantic search with fuzzy matching and vector similarity
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
                  title={mode.description}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{mode.label}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Advanced Search Bar */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <SearchBar
              onSearch={handleSearch}
              onLoading={handleLoading}
            />
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
                    onClick={() => handleQuickSearch(search)}
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
                      onClick={() => handleQuickSearch(search)}
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
            className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <SearchResults
              results={searchResults}
              loading={loading}
              query={query}
            />
          </motion.div>
        )}

        {/* Search Analytics */}
        <motion.div
          className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
            Search Engine Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {advancedSearch.getAnalytics().indexSize}
              </div>
              <div className="text-sm text-slate-400">Total Items Indexed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {advancedSearch.getAnalytics().vectorCount}
              </div>
              <div className="text-sm text-slate-400">Semantic Vectors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {advancedSearch.getAnalytics().initialized ? 'Ready' : 'Loading'}
              </div>
              <div className="text-sm text-slate-400">Search Engine Status</div>
            </div>
          </div>
        </motion.div>
      </div>
    </MemorAILayout>
  )
}
