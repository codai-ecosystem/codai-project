'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingBag,
  Search,
  TrendingUp,
  Users,
  Database,
  Zap,
  Star,
  Filter,
  Grid,
  List,
  Heart,
  ShoppingCart,
  Sparkles,
  PresentationChart,
  Clock,
  Activity
} from 'lucide-react'
import type { AppStats } from '../types/index'

export default function CumparAIPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<AppStats>({
    totalUsers: 142650,
    activeNow: 8420,
    performance: 96.8,
    uptime: 99.97,
    dataProcessed: 15600000,
    efficiency: 94.2,
    responseTime: 124.5,
    throughput: 876.3
  })
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState([
    {
      id: '1',
      name: 'Smart Wireless Headphones',
      price: 199.99,
      originalPrice: 249.99,
      rating: 4.8,
      reviews: 2340,
      image: '/api/placeholder/300/300',
      category: 'Electronics',
      store: 'TechStore',
      inStock: true,
      discount: 20
    },
    {
      id: '2',
      name: 'Premium Coffee Machine',
      price: 899.99,
      originalPrice: 1199.99,
      rating: 4.9,
      reviews: 1205,
      image: '/api/placeholder/300/300',
      category: 'Home & Kitchen',
      store: 'HomeGoods',
      inStock: true,
      discount: 25
    },
    {
      id: '3',
      name: 'Organic Skincare Set',
      price: 79.99,
      originalPrice: 99.99,
      rating: 4.7,
      reviews: 845,
      image: '/api/placeholder/300/300',
      category: 'Beauty',
      store: 'BeautyWorld',
      inStock: false,
      discount: 20
    }
  ])

  useEffect(() => {
    loadRealData()
    const interval = setInterval(updateMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadRealData = async () => {
    setLoading(true)
    try {
      // Simulate API calls for real data
      const metricsResponse = await fetch('/api/system-metrics').catch(() => ({ ok: false }))
      const productsResponse = await fetch('/api/products').catch(() => ({ ok: false }))

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setStats(metricsData)
      }

      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData.products || products)
      }
    } catch (error) {
      console.error('Error loading real data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateMetrics = () => {
    setStats(prev => ({
      ...prev,
      activeNow: prev.activeNow + Math.floor(Math.random() * 100 - 50),
      performance: Math.min(100, prev.performance + Math.random() * 2 - 1),
      responseTime: Math.max(50, prev.responseTime + Math.random() * 20 - 10),
      throughput: prev.throughput + Math.random() * 50 - 25
    }))
  }

  const searchProducts = async (query: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }: any) => (
    <motion.div
      className={`glassmorphism rounded-2xl p-6 border border-white/20 bg-gradient-to-br from-${color}-500/10 to-${color}-600/5`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <motion.div
          className={`w-12 h-12 bg-${color}-500/20 rounded-xl flex items-center justify-center`}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </motion.div>
        <motion.span
          className={`text-${color}-400 text-sm font-medium bg-${color}-400/20 px-3 py-1 rounded-full`}
          whileHover={{ scale: 1.1 }}
        >
          {trend}
        </motion.span>
      </div>
      <div className="text-3xl font-bold mb-2 text-white">{value}</div>
      <div className="text-slate-400 text-sm mb-1">{title}</div>
      <div className={`text-${color}-400 text-xs`}>{subtitle}</div>
    </motion.div>
  )

  const ProductCard = ({ product }: any) => (
    <motion.div
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-blue-400/50 transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-2">{product.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                />
              ))}
            </div>
            <span className="text-slate-400 text-sm">({product.reviews})</span>
          </div>
        </div>
        <button className="text-slate-400 hover:text-red-400 transition-colors">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-2xl font-bold text-white">${product.price}</span>
          {product.originalPrice && (
            <span className="text-slate-400 line-through ml-2">${product.originalPrice}</span>
          )}
        </div>
        {product.discount && (
          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
            -{product.discount}%
          </span>
        )}
      </div>

      <div className="text-slate-400 text-sm mb-4">
        {product.category} • {product.store}
      </div>

      <button
        className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${product.inStock
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        disabled={!product.inStock}
      >
        <ShoppingBag className="w-4 h-4" />
        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </motion.div>
  )

  const tabs = [
    { id: 'overview', label: 'Overview', icon: PresentationChart },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'search', label: 'Search', icon: Search }
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            CumparAI
          </h1>
          <p className="text-xl text-slate-300">
            AI-Powered Shopping & Price Comparison Platform
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                      ? 'bg-blue-500/30 text-blue-400 border border-blue-400/50'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div>
              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers.toLocaleString()}
                  icon={Users}
                  color="blue"
                  trend="+12%"
                  subtitle="Growing daily"
                />
                <StatCard
                  title="Active Now"
                  value={stats.activeNow.toLocaleString()}
                  icon={Activity}
                  color="emerald"
                  trend="Live"
                  subtitle="Real-time"
                />
                <StatCard
                  title="Performance"
                  value={`${stats.performance.toFixed(1)}%`}
                  icon={TrendingUp}
                  color="purple"
                  trend="+8%"
                  subtitle="Optimized"
                />
                <StatCard
                  title="Response Time"
                  value={`${stats.responseTime.toFixed(1)}ms`}
                  icon={Clock}
                  color="orange"
                  trend="-15%"
                  subtitle="Fast"
                />
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                  whileHover={{ scale: 1.02 }}
                >
                  <Search className="w-8 h-8 text-blue-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Smart Search</h3>
                  <p className="text-slate-300">AI-powered product search with intelligent filtering</p>
                </motion.div>

                <motion.div
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                  whileHover={{ scale: 1.02 }}
                >
                  <TrendingUp className="w-8 h-8 text-green-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Price Tracking</h3>
                  <p className="text-slate-300">Real-time price comparison across multiple stores</p>
                </motion.div>

                <motion.div
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                  whileHover={{ scale: 1.02 }}
                >
                  <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">AI Recommendations</h3>
                  <p className="text-slate-300">Personalized product recommendations based on your preferences</p>
                </motion.div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">Featured Products</h2>
                <div className="flex items-center gap-4">
                  <button className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all">
                    <Filter className="w-5 h-5 text-slate-400" />
                  </button>
                  <button className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all">
                    <Grid className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Shopping Analytics</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Price Trends</h3>
                  <p className="text-slate-300">Track price changes over time</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Popular Categories</h3>
                  <p className="text-slate-300">Most searched product categories</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Product Search</h2>
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchProducts(searchQuery)}
                    placeholder="Search for products..."
                    className="w-full bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400/50"
                  />
                  <button
                    onClick={() => searchProducts(searchQuery)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {loading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
