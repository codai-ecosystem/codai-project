/**
 * ExplorerLayout - Advanced Blockchain Explorer Interface
 * Comprehensive blockchain navigation with multi-network support, real-time data, and analytics
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Menu,
  X,
  Globe,
  Activity,
  TrendingUp,
  Zap,
  Shield,
  Database,
  Clock,
  Bell,
  Settings,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  Copy,
  ExternalLink,
  Check,
  AlertTriangle,
  Info,
  Wallet,
  Coins,
  Layers,
  Network,
  ChevronDown,
  ChevronRight,
  Star,
  Bookmark,
  History,
  Download,
  Share,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Blocks,
  FileText
} from 'lucide-react'

interface ExplorerLayoutProps {
  children: React.ReactNode
  sidebarCollapsed?: boolean
  onSidebarToggle?: () => void
  currentNetwork?: string
  onNetworkChange?: (network: string) => void
  searchEnabled?: boolean
  notifications?: number
}

interface NetworkInfo {
  id: string
  name: string
  symbol: string
  chainId: number
  status: 'active' | 'maintenance' | 'deprecated'
  blockTime: number
  gasPrice: string
  color: string
  icon: React.ReactNode
}

interface SearchResult {
  type: 'address' | 'transaction' | 'block' | 'token' | 'contract'
  id: string
  title: string
  subtitle: string
  value?: string
  icon: React.ReactNode
}

interface RealtimeData {
  blockHeight: number
  gasPrice: string
  tps: number
  pendingTxs: number
  marketPrice: number
  change24h: number
}

const ExplorerLayout: React.FC<ExplorerLayoutProps> = ({
  children,
  sidebarCollapsed = false,
  onSidebarToggle,
  currentNetwork = 'ethereum',
  onNetworkChange,
  searchEnabled = true,
  notifications = 0
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null)
  const [showNetworkSelector, setShowNetworkSelector] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [copiedText, setCopiedText] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [priceAlerts, setPriceAlerts] = useState<boolean>(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Supported networks
  const networks: NetworkInfo[] = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      chainId: 1,
      status: 'active',
      blockTime: 12,
      gasPrice: '25 gwei',
      color: '#627EEA',
      icon: <Coins className="w-4 h-4" />
    },
    {
      id: 'polygon',
      name: 'Polygon',
      symbol: 'MATIC',
      chainId: 137,
      status: 'active',
      blockTime: 2,
      gasPrice: '30 gwei',
      color: '#8247E5',
      icon: <Layers className="w-4 h-4" />
    },
    {
      id: 'arbitrum',
      name: 'Arbitrum',
      symbol: 'ETH',
      chainId: 42161,
      status: 'active',
      blockTime: 1,
      gasPrice: '0.1 gwei',
      color: '#28A0F0',
      icon: <Network className="w-4 h-4" />
    },
    {
      id: 'optimism',
      name: 'Optimism',
      symbol: 'ETH',
      chainId: 10,
      status: 'active',
      blockTime: 2,
      gasPrice: '0.001 gwei',
      color: '#FF0420',
      icon: <Zap className="w-4 h-4" />
    }
  ]

  const currentNetworkInfo = networks.find(n => n.id === currentNetwork) || networks[0]

  // Navigation items
  const navigationItems = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <Activity className="w-4 h-4" />,
      href: '/explorer',
      badge: null
    },
    {
      id: 'blocks',
      title: 'Blocks',
      icon: <Blocks className="w-4 h-4" />,
      href: '/explorer/blocks',
      badge: 'Live'
    },
    {
      id: 'transactions',
      title: 'Transactions',
      icon: <FileText className="w-4 h-4" />,
      href: '/explorer/transactions',
      badge: null
    },
    {
      id: 'addresses',
      title: 'Addresses',
      icon: <Wallet className="w-4 h-4" />,
      href: '/explorer/addresses',
      badge: null
    },
    {
      id: 'tokens',
      title: 'Tokens',
      icon: <Coins className="w-4 h-4" />,
      href: '/explorer/tokens',
      badge: null
    },
    {
      id: 'contracts',
      title: 'Smart Contracts',
      icon: <Shield className="w-4 h-4" />,
      href: '/explorer/contracts',
      badge: null
    },
    {
      id: 'defi',
      title: 'DeFi Analytics',
      icon: <TrendingUp className="w-4 h-4" />,
      href: '/explorer/defi',
      badge: 'New'
    },
    {
      id: 'mev',
      title: 'MEV Dashboard',
      icon: <Zap className="w-4 h-4" />,
      href: '/explorer/mev',
      badge: 'Pro'
    },
    {
      id: 'analytics',
      title: 'Network Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      href: '/explorer/analytics',
      badge: null
    }
  ]

  // Mock search function
  const performSearch = async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) return []

    await new Promise(resolve => setTimeout(resolve, 200))

    const results: SearchResult[] = []

    // Detect query type and generate appropriate results
    if (query.match(/^0x[a-fA-F0-9]{64}$/)) {
      results.push({
        type: 'transaction',
        id: query,
        title: 'Transaction',
        subtitle: formatAddress(query),
        icon: <FileText className="w-4 h-4" />
      })
    } else if (query.match(/^0x[a-fA-F0-9]{40}$/)) {
      results.push({
        type: 'address',
        id: query,
        title: 'Address',
        subtitle: formatAddress(query),
        value: '125.5 ETH',
        icon: <Wallet className="w-4 h-4" />
      })
    } else if (query.match(/^\d+$/)) {
      results.push({
        type: 'block',
        id: query,
        title: `Block #${query}`,
        subtitle: `${Math.floor(Math.random() * 300)} transactions`,
        icon: <Blocks className="w-4 h-4" />
      })
    } else {
      // Text search
      if (query.toLowerCase().includes('eth')) {
        results.push({
          type: 'token',
          id: 'ethereum',
          title: 'Ethereum (ETH)',
          subtitle: 'Native token',
          value: '$2,455.23',
          icon: <Coins className="w-4 h-4" />
        })
      }
      if (query.toLowerCase().includes('usdc')) {
        results.push({
          type: 'token',
          id: 'usdc',
          title: 'USD Coin (USDC)',
          subtitle: 'Stablecoin',
          value: '$1.00',
          icon: <Coins className="w-4 h-4" />
        })
      }
    }

    return results
  }

  // Mock realtime data
  useEffect(() => {
    const updateRealtimeData = () => {
      setRealtimeData({
        blockHeight: 18500000 + Math.floor(Math.random() * 1000),
        gasPrice: (20 + Math.random() * 30).toFixed(0),
        tps: 12 + Math.random() * 8,
        pendingTxs: 2500 + Math.floor(Math.random() * 1000),
        marketPrice: 2400 + Math.random() * 200,
        change24h: (Math.random() - 0.5) * 10
      })
    }

    updateRealtimeData()
    const interval = setInterval(updateRealtimeData, 5000)
    return () => clearInterval(interval)
  }, [currentNetwork])

  // Handle search
  useEffect(() => {
    if (searchQuery) {
      const searchTimeout = setTimeout(async () => {
        const results = await performSearch(searchQuery)
        setSearchResults(results)
      }, 300)

      return () => clearTimeout(searchTimeout)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }

      if (e.key === 'Escape') {
        setIsSearchFocused(false)
        setShowNetworkSelector(false)
        setShowNotifications(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const formatAddress = (address: string, chars = 6): string => {
    if (!address || address.length < 10) return address
    return `${address.slice(0, chars)}...${address.slice(-chars)}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      setTimeout(() => setCopiedText(''), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const addToFavorites = (id: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  const executeSearch = (query: string) => {
    if (query && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)])
    }
    setSearchQuery(query)
    setIsSearchFocused(false)
    // Navigate to search results
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 lg:relative lg:z-auto"
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Explorer
                  </span>
                </div>

                <button
                  onClick={onSidebarToggle}
                  className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Network Selector */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <button
                    onClick={() => setShowNetworkSelector(!showNetworkSelector)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: currentNetworkInfo.color }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentNetworkInfo.name}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  <AnimatePresence>
                    {showNetworkSelector && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                      >
                        {networks.map((network) => (
                          <button
                            key={network.id}
                            onClick={() => {
                              onNetworkChange?.(network.id)
                              setShowNetworkSelector(false)
                            }}
                            className={`
                              w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                              ${network.id === currentNetwork ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                              first:rounded-t-lg last:rounded-b-lg
                            `}
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: network.color }}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {network.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {network.gasPrice} • {network.blockTime}s blocks
                              </p>
                            </div>
                            {network.status !== 'active' && (
                              <span className={`
                                px-2 py-1 rounded-full text-xs
                                ${network.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}
                              `}>
                                {network.status}
                              </span>
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Realtime Stats */}
                {realtimeData && (
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                      <div className="text-gray-500 dark:text-gray-400">Block Height</div>
                      <div className="font-mono font-medium text-gray-900 dark:text-white">
                        {realtimeData.blockHeight.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                      <div className="text-gray-500 dark:text-gray-400">Gas Price</div>
                      <div className="font-mono font-medium text-gray-900 dark:text-white">
                        {realtimeData.gasPrice} gwei
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                      <div className="text-gray-500 dark:text-gray-400">TPS</div>
                      <div className="font-mono font-medium text-gray-900 dark:text-white">
                        {realtimeData.tps.toFixed(1)}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                      <div className="text-gray-500 dark:text-gray-400">Price</div>
                      <div className={`font-mono font-medium ${realtimeData.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        ${realtimeData.marketPrice.toFixed(0)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <a
                      key={item.id}
                      href={item.href}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors group"
                    >
                      <div className="flex items-center space-x-2">
                        {item.icon}
                        <span>{item.title}</span>
                      </div>

                      {item.badge && (
                        <span className={`
                          px-1.5 py-0.5 text-xs rounded-full
                          ${item.badge === 'Live' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            item.badge === 'New' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                              item.badge === 'Pro' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </a>
                  ))}
                </nav>

                {/* Favorites Section */}
                {favorites.size > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Favorites
                    </h3>
                    <div className="space-y-1">
                      {Array.from(favorites).slice(0, 5).map((favoriteId) => (
                        <div key={favoriteId} className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                          <span className="font-mono">{formatAddress(favoriteId)}</span>
                          <button
                            onClick={() => addToFavorites(favoriteId)}
                            className="text-yellow-500 hover:text-yellow-600"
                          >
                            <Star className="w-3 h-3 fill-current" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>API Status: Online</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Live</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left Side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onSidebarToggle}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Network indicator for collapsed sidebar */}
              {sidebarCollapsed && (
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: currentNetworkInfo.color }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentNetworkInfo.name}
                  </span>
                </div>
              )}
            </div>

            {/* Search */}
            {searchEnabled && (
              <div className="flex-1 max-w-2xl mx-4 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search addresses, transactions, blocks, tokens... (⌘K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery) {
                        executeSearch(searchQuery)
                      }
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {isSearchFocused && (searchQuery || recentSearches.length > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
                    >
                      {searchResults.length > 0 ? (
                        <div className="p-2">
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                            Results
                          </h4>
                          {searchResults.map((result) => (
                            <button
                              key={result.id}
                              onClick={() => executeSearch(searchQuery)}
                              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                              <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                {result.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {result.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {result.subtitle}
                                </p>
                              </div>
                              {result.value && (
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {result.value}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : searchQuery ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          <Search className="w-8 h-8 mx-auto mb-2" />
                          <p>No results found for "{searchQuery}"</p>
                          <p className="text-xs mt-1">Try searching for an address, transaction hash, or block number</p>
                        </div>
                      ) : (
                        <div className="p-4">
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Recent Searches
                          </h4>
                          <div className="space-y-1">
                            {recentSearches.map((term, index) => (
                              <button
                                key={index}
                                onClick={() => executeSearch(term)}
                                className="block w-full text-left px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-mono"
                              >
                                {formatAddress(term, 10)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Right Side */}
            <div className="flex items-center space-x-2">
              {/* Quick Stats */}
              {realtimeData && (
                <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Activity className="w-4 h-4" />
                    <span>{realtimeData.tps.toFixed(1)} TPS</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>{realtimeData.gasPrice} gwei</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${realtimeData.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {realtimeData.change24h >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span>${realtimeData.marketPrice.toFixed(0)}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setPriceAlerts(!priceAlerts)}
                  className={`p-2 rounded-lg transition-colors ${priceAlerts
                      ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  title="Price alerts"
                >
                  <Bell className="w-4 h-4" />
                </button>

                <button
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Refresh data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                      >
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            Blockchain Alerts
                          </h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {[
                            { type: 'transaction', message: 'Large ETH transfer detected', time: '2 min ago', severity: 'high' },
                            { type: 'contract', message: 'New smart contract deployed', time: '5 min ago', severity: 'info' },
                            { type: 'gas', message: 'Gas prices increasing rapidly', time: '10 min ago', severity: 'warning' }
                          ].map((notification, index) => (
                            <div key={index} className="p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  {notification.severity === 'high' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                  {notification.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                                  {notification.severity === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default ExplorerLayout
